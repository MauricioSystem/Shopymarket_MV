const express = require('express');
const router = express.Router();
const {
    createRating,
    getRatingsByProduct,
    updateRating,
    deleteRating,
} = require('../../controllers/rating/ratingControllers');
const { authenticate, authorize } = require('../../middlewares');

// GET ratings de un producto (público)
router.get('/:productId', getRatingsByProduct);

// POST crear nuevo rating (solo usuarios logeados)
router.use(authenticate);
router.post('/', createRating);

// PUT actualizar rating (solo el propietario)
router.put('/:ratingId', updateRating);

// DELETE eliminar rating (solo el propietario o admin)
router.delete('/:ratingId', deleteRating);

module.exports = router;
