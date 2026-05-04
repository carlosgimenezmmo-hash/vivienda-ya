import { supabase } from '../lib/supabaseClient';

// Registrar usuario como agente
export const registerAgent = async (agentData, userId) => {
  try {
    // Validación defensiva antes de llamar a Supabase
    if (!userId) {
      console.error('[agentService] registerAgent: userId es null/undefined');
      return { success: false, error: 'Usuario no autenticado' };
    }

    console.log('[agentService] Llamando register_agent con p_user_id:', userId);

    const { data, error } = await supabase.rpc('register_agent', {
      p_user_id: userId,
      p_city: agentData.city,
      p_phone: agentData.phone,
      p_description: agentData.description,
      p_avatar_url: agentData.avatarUrl || null,
    });

    console.log('[agentService] RPC response:', { data, error });

    if (error) {
      console.error('[agentService] Error RPC:', error);
      return { success: false, error: error.message };
    }

    // La función SQL devuelve JSON — lo normalizamos
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    return result ?? { success: false, error: 'Respuesta vacía del servidor' };

  } catch (err) {
    console.error('[agentService] Excepción en registerAgent:', err);
    return { success: false, error: err.message };
  }
};

// Obtener dashboard del agente
export const getAgentDashboard = async () => {
  try {
    const { data, error } = await supabase.rpc('get_agent_dashboard');
    if (error) throw error;
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('[agentService] Error obteniendo dashboard:', error);
    return { success: false, error: error.message };
  }
};

// Registrar contacto (clic en WhatsApp)
export const registerContact = async (propertyId, buyerPhone, buyerName = null) => {
  try {
    const { data, error } = await supabase.rpc('register_contact', {
      p_property_id: propertyId,
      p_buyer_phone: buyerPhone,
      p_buyer_name: buyerName,
    });
    if (error) throw error;
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('[agentService] Error registrando contacto:', error);
    return { success: false, error: error.message };
  }
};

// Obtener propiedades del agente
export const getAgentProperties = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: agentProps, error } = await supabase
      .from('agent_properties')
      .select(`
        property_id,
        properties (
          id,
          title,
          price,
          location,
          images,
          description
        )
      `)
      .eq('agent_id', user.id);

    if (error) throw error;
    return agentProps?.map(item => item.properties) || [];
  } catch (error) {
    console.error('[agentService] Error obteniendo propiedades:', error);
    return [];
  }
};

// Asignar propiedad a agente
export const assignPropertyToAgent = async (propertyId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const { error } = await supabase
      .from('agent_properties')
      .insert({ agent_id: user.id, property_id: propertyId });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[agentService] Error asignando propiedad:', error);
    return { success: false, error: error.message };
  }
};

// Verificar si usuario es agente
export const checkIsAgent = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('users')
      .select('is_agent')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data?.is_agent || false;
  } catch (error) {
    console.error('[agentService] Error verificando agente:', error);
    return false;
  }
};