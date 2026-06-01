'use client';
import { useState, useEffect } from 'react';
import { getAgentDashboard } from '../services/agentService';

export default function AgentDashboardScreen() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const data = await getAgentDashboard();
    if (data.success) setDashboard(data);
    setLoading(false);
  };

  if (loading) return <div style={styles.center}>Cargando...</div>;
  if (!dashboard?.success) return <div style={styles.center}>Error cargando dashboard</div>;

  const totalStats = dashboard.stats?.reduce((acc, stat) => ({
    views: acc.views + (stat.total_views || 0),
    contacts: acc.contacts + (stat.total_contacts || 0)
  }), { views: 0, contacts: 0 }) || { views: 0, contacts: 0 };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.welcome}>Bienvenido/a</h1>
        <div style={styles.subscriptionCard}>
          <p>🎁 Período de prueba</p>
        </div>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h2>{dashboard.properties?.length || 0}</h2>
          <p>Propiedades</p>
        </div>
        <div style={styles.statCard}>
          <h2>{totalStats.views}</h2>
          <p>Visitas</p>
        </div>
        <div style={styles.statCard}>
          <h2>{totalStats.contacts}</h2>
          <p>Contactos</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Tus propiedades</h2>
        {dashboard.properties?.length > 0 ? (
          dashboard.properties.map((prop, i) => (
            <div key={i} style={styles.propertyCard}>
              <h3>{prop.title}</h3>
              <p>${prop.price?.toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No tenés propiedades asignadas</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '80px' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  header: { backgroundColor: '#4CAF50', padding: '40px 20px', color: '#fff' },
  welcome: { fontSize: '28px', margin: 0 },
  subscriptionCard: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px', marginTop: '10px' },
  statsContainer: { display: 'flex', padding: '15px', gap: '10px' },
  statCard: { flex: 1, backgroundColor: '#fff', padding: '15px', borderRadius: '10px', textAlign: 'center' },
  section: { padding: '15px' },
  sectionTitle: { fontSize: '18px', marginBottom: '10px' },
  propertyCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px' }
};