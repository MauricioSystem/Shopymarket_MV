const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const pool = require('./src/db/database');

const userRoutes = require('./routes/user/userRoutes');
const authRoutes = require('./routes/auth/authRoutes');
const storeRoutes = require('./routes/store/storeRoutes');
const serviceProfileRoutes = require('./routes/serviceProfile/serviceProfileRoutes');
const serviceRoutes = require('./routes/service/serviceRoutes');
const categoryRoutes = require('./routes/category/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategory/subcategoryRoutes');
const productRoutes = require('./routes/product/productRoutes');
const ratingRoutes = require('./routes/rating/ratingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Shopy Market API',
        });
    } catch (err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/service-profiles', serviceProfileRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ratings', ratingRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
