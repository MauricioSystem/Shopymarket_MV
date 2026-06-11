const shippingService = require('../../services/shippingService/shippingService');

/**
 * Calculate shipping cost between store and customer address
 * Request body: {
 *   storeLocation: { latitude, longitude },
 *   customerLocation: { latitude, longitude }
 * }
 */
const calculateShippingCost = async (req, res) => {
    try {
        const { storeLocation, customerLocation } = req.body;
        
        if (!storeLocation || !customerLocation) {
            return res.status(400).json({
                success: false,
                message: 'Store location and customer location are required'
            });
        }
        
        const result = shippingService.calculateShippingFromLocations(storeLocation, customerLocation);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error calculating shipping cost',
            error: error.message
        });
    }
};

/**
 * Get default shipping cost when location is not available
 */
const getDefaultShippingCost = async (req, res) => {
    try {
        const defaultCost = shippingService.getDefaultShippingCost();
        return res.status(200).json({
            success: true,
            defaultShippingCost: defaultCost,
            message: 'Default shipping cost retrieved'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving default shipping cost',
            error: error.message
        });
    }
};

module.exports = {
    calculateShippingCost,
    getDefaultShippingCost
};
