
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    // We will handle this gracefully in the UI if keys are missing
    console.warn('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
