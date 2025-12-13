
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPartners() {
    console.log('--- START CHECK ---');
    const { data, error } = await supabase
        .from('partners')
        .select('*');

    if (error) {
        console.error('ERROR:', error.message);
    } else {
        console.log('COUNT:', data ? data.length : 0);
        if (data && data.length > 0) {
            console.log('NAMES:', data.map(p => p.name).join(', '));
        }
    }
    console.log('--- END CHECK ---');
}

checkPartners();
