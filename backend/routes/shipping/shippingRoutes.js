const express = require('express');
const router = express.Router();
const { calculateShippingCost, getDefaultShippingCost } = require('../../controllers/shipping/shippingControllers');
const { authenticate } = require('../../middlewares');

router.use(authenticate);

// Calculate shipping cost between two locations
router.post('/calculate', calculateShippingCost);

// Get default shipping cost
router.get('/default', getDefaultShippingCost);

module.exports = router;
