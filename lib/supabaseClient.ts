import { createClient } from '@supabase/supabase-js';

// PEGÁ TUS DATOS REALES ACÁ ADENTRO PARA PROBAR
const supabaseUrl = 'https://issofymslvkyfimdnlqe.supabase.co';
const supabaseAnonKey = 'sb_publishable_2KTRPUlnFuFC84Ek_NkyfA_TQVn7Pu6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
