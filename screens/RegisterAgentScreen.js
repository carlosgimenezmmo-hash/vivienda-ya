'use client';
import { useState } from 'react';
import { registerAgent } from '../services/agentService';
import { useRouter } from 'next/navigation';

export default function RegisterAgentScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    city: '',
    phone: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.city || !formData.phone || !formData.description) {
      alert('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    const result = await registerAgent(formData);
    setLoading(false);

    if (result.success) {
      alert('Registro exitoso! Su periodo de prueba termina en 30 dias');
      router.push('/AgentDashboard');
    } else {
      alert(result.error || 'No se pudo registrar el agente');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Registrate como Agente</h1>
        <p style={styles.subtitle}>30 dias gratis - $40 USD/mes despues</p>
      </div>

      <div style={styles.form}>
        <label style={styles.label}>Ciudad donde opera</label>
        <input
          style={styles.input}
          placeholder="Ej: Buenos Aires, Cordoba, Mendoza"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />

        <label style={styles.label}>Telefono de contacto</label>
        <input
          style={styles.input}
          placeholder="+54 9 11 1234-5678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <label style={styles.label}>Descripcion profesional</label>
        <textarea
          style={{...styles.input, ...styles.textArea}}
          placeholder="Cuentenos sobre su experiencia, especialidad, etc."
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <button
          style={styles.button}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Activar cuenta de agente'}
        </button>

        <button
          style={styles.skipButton}
          onClick={() => router.back()}
        >
          Por ahora no, gracias
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingBottom: '80px'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: '40px 20px',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#fff',
    marginTop: '5px'
  },
  form: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '5px',
    marginTop: '15px'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box'
  },
  textArea: {
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  button: {
    width: '100%',
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    marginTop: '30px',
    cursor: 'pointer'
  },
  skipButton: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#999',
    padding: '15px',
    fontSize: '16px',
    border: 'none',
    marginTop: '15px',
    cursor: 'pointer'
  }
};