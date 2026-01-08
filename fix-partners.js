
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
        let value = parts.slice(1).join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) { console.log('Env missing'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fix() {
    // 1. Check count
    const { data: existing, error: fetchError } = await supabase.from('partners').select('*');

    if (fetchError) {
        console.log('Fetch Error: ' + fetchError.message);
        return;
    }

    console.log('Current Count: ' + (existing ? existing.length : 0));

    if (!existing || existing.length === 0) {
        console.log('Inserting default partners...');
        const { error: insertError } = await supabase
            .from('partners')
            .insert([{ name: 'Putty' }, { name: 'Sony' }]);

        if (insertError) {
            console.log('Insert Error: ' + insertError.message);
        } else {
            console.log('Success: Partners inserted.');
        }
    } else {
        console.log('Partners already exist.');
    }
}

fix();
