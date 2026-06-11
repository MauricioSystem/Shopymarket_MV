/**
 * Haversine formula to calculate distance between two coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculate shipping cost based on distance
 * Range: 3 to 10 Bs (Bolivianos)
 * Formula: 
 * - 0-2km: 3 Bs (base cost)
 * - 2-10km: 3 + (distance - 2) * 0.875 Bs
 * - 10+km: 10 Bs (max cost)
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Shipping cost in Bs
 */
const calculateShippingCost = (distanceKm) => {
    const MIN_COST = 3;
    const MAX_COST = 10;
    const BASE_DISTANCE = 2; // First 2km included in base cost
    
    if (distanceKm <= BASE_DISTANCE) {
        return MIN_COST;
    }
    
    // For each km beyond base distance, add 0.875 Bs
    // This way: 2km = 3, 10km = 10
    const costPerKm = (MAX_COST - MIN_COST) / (10 - BASE_DISTANCE); // 0.875
    const calculatedCost = MIN_COST + (distanceKm - BASE_DISTANCE) * costPerKm;
    
    return Math.min(calculatedCost, MAX_COST);
};

/**
 * Calculate shipping cost between store and customer address
 * @param {object} storeLocation - {latitude, longitude}
 * @param {object} customerLocation - {latitude, longitude}
 * @returns {object} {distance, cost}
 */
const calculateShippingFromLocations = (storeLocation, customerLocation) => {
    try {
        const { latitude: lat1, longitude: lon1 } = storeLocation;
        const { latitude: lat2, longitude: lon2 } = customerLocation;
        
        if (!lat1 || !lon1 || !lat2 || !lon2) {
            throw new Error('Invalid coordinates provided');
        }
        
        const distance = calculateDistance(lat1, lon1, lat2, lon2);
        const cost = calculateShippingCost(distance);
        
        return {
            success: true,
            distance: parseFloat(distance.toFixed(2)),
            shippingCost: parseFloat(cost.toFixed(2)),
            message: 'Shipping cost calculated successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'Error calculating shipping cost'
        };
    }
};

/**
 * Get default shipping cost (when location is not available)
 * @returns {number} Default shipping cost in Bs
 */
const getDefaultShippingCost = () => {
    return 5; // Middle point between 3 and 10
};

module.exports = {
    calculateDistance,
    calculateShippingCost,
    calculateShippingFromLocations,
    getDefaultShippingCost
};
