import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gnygsxggeogmjvvhsmgw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueWdzeGdnZW9nbWp2dmhzbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjkyMDYsImV4cCI6MjA5MTI0NTIwNn0.Zr7QHzzsOXTPbQ-P4HDpgv0O2UQw6zKX1Nsd8LXgFTU'

export const supabase = createClient(supabaseUrl, supabaseKey)