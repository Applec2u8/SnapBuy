import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
  const schema = await res.json();
  
  console.log('Exposed Tables/Views:', Object.keys(schema.definitions || {}));
  
  const rpcs = [];
  for (const path in schema.paths) {
    if (path.startsWith('/rpc/')) {
      rpcs.push(path.substring(5));
    }
  }
  console.log('Exposed RPCs:', rpcs);
}

main();
