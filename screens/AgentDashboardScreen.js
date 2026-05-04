import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { getAgentDashboard } from '../services/agentService';

export default function AgentDashboardScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const data = await getAgentDashboard();
    if (data.success) {
      setDashboard(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!dashboard?.success) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error cargando dashboard</Text>
        <TouchableOpacity onPress={loadDashboard}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalStats = dashboard.stats?.reduce((acc, stat) => ({
    views: acc.views + (stat.total_views || 0),
    contacts: acc.contacts + (stat.total_contacts || 0)
  }), { views: 0, contacts: 0 }) || { views: 0, contacts: 0 };

  const subscription = dashboard.subscription;
  const daysLeft = subscription?.trial_end 
    ? Math.ceil((new Date(subscription.trial_end) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>¡Bienvenido/a!</Text>
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionStatus}>
            {subscription?.status === 'trial' ? '🎁 Período de prueba' : '📋 Plan activo'}
          </Text>
          {subscription?.status === 'trial' && (
            <Text style={styles.daysLeft}>
              {daysLeft} días gratis restantes
            </Text>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboard.properties?.length || 0}</Text>
          <Text style={styles.statLabel}>Propiedades</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalStats.views}</Text>
          <Text style={styles.statLabel}>Visitas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalStats.contacts}</Text>
          <Text style={styles.statLabel}>Contactos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Actividad reciente</Text>
        <View style={styles.chartContainer}>
          {dashboard.stats?.slice(0, 7).map((stat, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={[styles.bar, { height: Math.min((stat.total_contacts || 0) * 10, 100) }]} />
              <Text style={styles.chartLabel}>
                {new Date(stat.date).toLocaleDateString('es', { weekday: 'short' })}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Tus propiedades</Text>
        {dashboard.properties?.length > 0 ? (
          dashboard.properties.slice(0, 5).map((prop, index) => (
            <TouchableOpacity
              key={index}
              style={styles.propertyCard}
              onPress={() => navigation.navigate('PropertyDetail', { propertyId: prop.property_id })}
            >
              <Text style={styles.propertyTitle}>{prop.title}</Text>
              <Text style={styles.propertyPrice}>${prop.price?.toLocaleString()}</Text>
              <View style={styles.propertyStats}>
                <Text style={styles.propertyStat}>👁️ {prop.views} vistas</Text>
                <Text style={styles.propertyStat}>💬 {prop.contacts} contactos</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Aún no tenés propiedades asignadas</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Últimos contactos</Text>
        {dashboard.recent_contacts?.length > 0 ? (
          dashboard.recent_contacts.map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <Text style={styles.contactName}>{contact.buyer_name || 'Cliente'}</Text>
              <Text style={styles.contactPhone}>{contact.buyer_phone}</Text>
              <Text style={styles.contactDate}>
                {new Date(contact.contacted_at).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aún no hay contactos registrados</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  subscriptionCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  subscriptionStatus: {
    color: '#fff',
    fontSize: 14
  },
  daysLeft: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10
  },
  chartBar: {
    alignItems: 'center'
  },
  bar: {
    width: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    marginBottom: 5
  },
  chartLabel: {
    fontSize: 10,
    color: '#666'
  },
  propertyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  propertyPrice: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5
  },
  propertyStats: {
    flexDirection: 'row',
    marginTop: 10
  },
  propertyStat: {
    fontSize: 12,
    color: '#666',
    marginRight: 15
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500'
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
  contactDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: 'red'
  },
  retryText: {
    color: '#4CAF50',
    marginTop: 10
  }
});