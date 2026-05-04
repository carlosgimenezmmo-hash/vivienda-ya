import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { registerAgent } from '../services/agentService';

export default function RegisterAgentScreen({ navigation }) {
  const [formData, setFormData] = useState({
    city: '',
    phone: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.city || !formData.phone || !formData.description) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }

    setLoading(true);
    const result = await registerAgent(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        '¡Registro exitoso!',
        `Tu período de prueba gratis termina el ${new Date(result.trial_end).toLocaleDateString()}`,
        [{ text: 'OK', onPress: () => navigation.replace('AgentDashboard') }]
      );
    } else {
      Alert.alert('Error', result.error || 'No se pudo registrar el agente');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 Registrate como Agente</Text>
        <Text style={styles.subtitle}>30 días gratis • $40 USD/mes después</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Ciudad donde operás</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Buenos Aires, Córdoba, Mendoza..."
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
        />

        <Text style={styles.label}>Teléfono de contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="+54 9 11 1234-5678"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
        />

        <Text style={styles.label}>Descripción profesional</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Contanos sobre tu experiencia, especialidad, etc."
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Activar cuenta de agente</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipText}>Por ahora no, gracias</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5
  },
  form: {
    padding: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 15
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  skipButton: {
    marginTop: 15,
    alignItems: 'center'
  },
  skipText: {
    color: '#999',
    fontSize: 16
  }
});