import fs from 'fs';

const schema = JSON.parse(fs.readFileSync('scratch/openapi_schema.json', 'utf8'));

const placeOrderPath = schema.paths['/rpc/place_order'];
if (placeOrderPath) {
  console.log('--- place_order RPC schema ---');
  console.log(JSON.stringify(placeOrderPath, null, 2));
} else {
  console.log('place_order not found in schema');
}

// Let's also check table columns for orders, order_items, profiles, shops, store_quotas
const checkTables = ['orders', 'order_items', 'profiles', 'shops', 'store_quotas'];
console.log('\n--- Table Schema Columns ---');
for (const table of checkTables) {
  const definition = schema.definitions[table];
  if (definition) {
    console.log(`${table} columns:`, Object.keys(definition.properties || {}));
  } else {
    console.log(`${table} not found in definitions`);
  }
}
