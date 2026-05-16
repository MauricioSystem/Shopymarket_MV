const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Probar la conexión al iniciar
pool.on('connect', () => {
    console.log('✅ Conexión establecida con ShopyMarket_DB');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en la base de datos:', err);
    process.exit(-1);
});

module.exports = pool;
