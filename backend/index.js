const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de bienvenida 
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a la API de Shopy Market',
        endpoints: {
            test_db: '/'
        }
    });
});

// Ruta de prueba
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Conexión a la base de datos activa',
            serverTime: result.rows[0].now
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
