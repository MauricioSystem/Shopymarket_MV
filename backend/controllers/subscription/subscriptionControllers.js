const subscriptionModel = require('../../models/subscriptionModel');

const getPlans = async (req, res) => {
    try {
        const plans = await subscriptionModel.getAllPlans();
        return res.status(200).json({ success: true, data: plans });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMySubscription = async (req, res) => {
    try {
        const subscription = await subscriptionModel.getActiveSubscription(req.user.id);
        return res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMySubscriptionHistory = async (req, res) => {
    try {
        const subscriptions = await subscriptionModel.getUserSubscriptions(req.user.id);
        return res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const subscribeToPlan = async (req, res) => {
    try {
        const { plan_id } = req.body;
        if (!plan_id) {
            return res.status(400).json({ success: false, message: 'plan_id es requerido' });
        }

        const plan = await subscriptionModel.getPlanById(plan_id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan no encontrado' });
        }

        if (plan.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Este plan no está disponible' });
        }

        const subscription = await subscriptionModel.subscribe(req.user.id, plan_id);
        return res.status(201).json({ success: true, data: subscription, message: 'Suscripción activada exitosamente' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const cancelMySubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await subscriptionModel.cancelSubscription(id, req.user.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Suscripción no encontrada' });
        }
        return res.status(200).json({ success: true, data: result, message: 'Suscripción cancelada' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPlans,
    getMySubscription,
    getMySubscriptionHistory,
    subscribeToPlan,
    cancelMySubscription
};
