const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool de conexión
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Probar la conexión al iniciar
pool.connect()
    .then(client => {
        console.log('✅ Conexión exitosa a PostgreSQL: ' + process.env.DB_DATABASE);
        client.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a PostgreSQL:', err.stack);
    });

module.exports = pool;
