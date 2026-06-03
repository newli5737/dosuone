/**
 * Tạo database dosuone nếu chưa có (chạy: node scripts/create-db.js)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const dbName = process.env.DB_NAME || 'dosuone';
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  const exists = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [dbName],
  );
  if (exists.rowCount > 0) {
    console.log(`Database "${dbName}" đã tồn tại.`);
  } else {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Đã tạo database "${dbName}".`);
  }
  await client.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
