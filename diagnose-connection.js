
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
let envVars = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
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
} catch (e) {
    console.log("Could not read .env.local:", e.message);
}

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("--- DIAGNOSTICS ---");
console.log("URL defined:", !!url);
if (url) {
    console.log("URL starts with https:", url.startsWith("https://"));
    console.log("URL length:", url.length);
    console.log("URL (first 15 chars):", url.substring(0, 15) + "...");
}
console.log("Key defined:", !!key);
if (key) {
    console.log("Key length:", key.length);
}

if (url && key) {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(url, key);

    (async () => {
        try {
            console.log("Attempting fetch to Supabase...");
            const { data, error } = await supabase.from('partners').select('count', { count: 'exact', head: true });
            if (error) {
                console.log("Supabase Error:", error.message);
                console.log("Error Details:", JSON.stringify(error, null, 2));
            } else {
                console.log("Connection Success!");
                console.log("Data:", data);
            }
        } catch (err) {
            console.log("Fetch/Network Exception:", err.message);
            if (err.cause) console.log("Cause:", err.cause);
        }
    })();
} else {
    console.log("Missing credentials. Cannot test connection.");
}
