const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares');
const {
    getPlans,
    getMySubscription,
    getMySubscriptionHistory,
    subscribeToPlan,
    cancelMySubscription
} = require('../../controllers/subscription/subscriptionControllers');

router.get('/plans', getPlans);

router.use(authenticate);
router.get('/me', getMySubscription);
router.get('/history', getMySubscriptionHistory);
router.post('/subscribe', subscribeToPlan);
router.put('/cancel/:id', cancelMySubscription);

module.exports = router;
