const express = require('express');
const router = express.Router();
const {
    getMyCart,
    addItem,
    updateItem,
    removeItem,
    clear
} = require('../../controllers/cart/cartControllers');
const { authenticate, authorize } = require('../../middlewares');

router.use(authenticate);
router.use(authorize('cliente'));

router.get('/my-cart', getMyCart);
router.post('/add-item', addItem);
router.put('/update-item', updateItem);
router.delete('/remove-item/:productId', removeItem);
router.delete('/clear', clear);

module.exports = router;
