import { supabase } from '../lib/supabaseClient'; // Ajustá la ruta según donde tengas tu supabase client

// Registrar usuario como agente
export const registerAgent = async (agentData) => {
  try {
    const { data, error } = await supabase.rpc('register_agent', {
      p_city: agentData.city,
      p_phone: agentData.phone,
      p_description: agentData.description,
      p_avatar_url: agentData.avatarUrl || null
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error registrando agente:', error);
    return { success: false, error: error.message };
  }
};

// Obtener dashboard del agente
export const getAgentDashboard = async () => {
  try {
    const { data, error } = await supabase.rpc('get_agent_dashboard');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    return { success: false, error: error.message };
  }
};

// Registrar contacto (clic en WhatsApp)
export const registerContact = async (propertyId, buyerPhone, buyerName = null) => {
  try {
    const { data, error } = await supabase.rpc('register_contact', {
      p_property_id: propertyId,
      p_buyer_phone: buyerPhone,
      p_buyer_name: buyerName
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error registrando contacto:', error);
    return { success: false, error: error.message };
  }
};

// Obtener propiedades del agente
export const getAgentProperties = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
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
      .eq('agent_id', user.user.id);
    
    if (error) throw error;
    return agentProps?.map(item => item.properties) || [];
  } catch (error) {
    console.error('Error obteniendo propiedades:', error);
    return [];
  }
};

// Asignar propiedad a agente
export const assignPropertyToAgent = async (propertyId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { success: false, error: 'Usuario no autenticado' };
    
    const { data, error } = await supabase
      .from('agent_properties')
      .insert({
        agent_id: user.user.id,
        property_id: propertyId
      });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error asignando propiedad:', error);
    return { success: false, error: error.message };
  }
};

// Verificar si usuario es agente
export const checkIsAgent = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;
    
    const { data, error } = await supabase
      .from('users')
      .select('is_agent')
      .eq('id', user.user.id)
      .single();
    
    if (error) throw error;
    return data?.is_agent || false;
  } catch (error) {
    console.error('Error verificando agente:', error);
    return false;
  }
};