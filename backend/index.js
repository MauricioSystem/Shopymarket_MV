const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de ShopyMarket' });
});

// Prueba de conexión a la BD mediante una consulta simple
app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            status: 'Conectado', 
            time: result.rows[0].now,
            database: process.env.DB_NAME 
        });
    } catch (error) {
        console.error('Error en la prueba de BD:', error);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
