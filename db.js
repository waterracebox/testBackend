const { Pool } = require('pg');
require('dotenv').config();

let pool;
function getPool(){
  if(!pool){
    const connectionString = process.env.DATABASE_URL;
    if(!connectionString){
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

async function initDb(){
  const p = getPool();
  await p.query(`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`);
}

function getClient(){
  return getPool();
}

module.exports = { initDb, getClient };
