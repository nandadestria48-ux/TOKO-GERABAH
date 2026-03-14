import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmelgomwzgqdthnzjvur.supabase.co'
const supabaseKey = 'sb_publishable_DlFSjGBTtzzhM05o6usyyw_jku2G1kQ'

export const supabase = createClient(supabaseUrl, supabaseKey)