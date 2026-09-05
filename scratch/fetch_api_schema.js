import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'application/openapi+json'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
    }
    const schema = await res.json();
    fs.writeFileSync('scratch/openapi_schema.json', JSON.stringify(schema, null, 2));
    console.log('Schema written to scratch/openapi_schema.json');
    
    // Print summary of RPC paths
    const paths = Object.keys(schema.paths || {});
    const rpcs = paths.filter(p => p.startsWith('/rpc/'));
    console.log('Found RPCs:', rpcs);
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

run();
