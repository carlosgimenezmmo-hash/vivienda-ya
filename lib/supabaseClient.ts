import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://issofymslvkyfimdnlqe.supabase.co'
const supabaseAnonKey = 'sb_publishable_2KTRPUlnFuFC84Ek_NkyfA_TQVn7Pu6'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)