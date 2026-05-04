import { createClient } from '@supabase/supabase-js'

// ⚠️ REEMPLAZÁ CON TUS DATOS DE SUPABASE ⚠️
const supabaseUrl = 'https://tusitio.supabase.co'
const supabaseAnonKey = 'tu-clave-anonima-aqui'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)