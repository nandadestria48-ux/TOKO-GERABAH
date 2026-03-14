const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vmelgomwzgqdthnzjvur.supabase.co'
const supabaseKey = 'nandadestria' // Assuming this is the service role key

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase