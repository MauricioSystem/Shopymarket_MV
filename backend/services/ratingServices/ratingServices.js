const ratingModel = require('../../models/ratingModel');

const createRating = async (ratingData) => {
    try {
        const { product_id, user_id, score, comment } = ratingData;

        if (!product_id || !user_id || !score) {
            throw new Error('product_id, user_id y score son obligatorios');
        }

        if (score < 1 || score > 5 || !Number.isInteger(score)) {
            throw new Error('El score debe ser un número entero entre 1 y 5');
        }

        const existingRating = await ratingModel.checkUserRating(product_id, user_id);
        if (existingRating) {
            throw new Error('Este usuario ya ha calificado este producto');
        }

        const rating = await ratingModel.createRating(ratingData);
        return { success: true, data: rating };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const getRatingsByProduct = async (productId) => {
    try {
        if (!productId) {
            throw new Error('El productId es obligatorio');
        }

        const ratings = await ratingModel.getRatingsByProductId(productId);
        const stats = await ratingModel.getProductAverageRating(productId);

        return {
            success: true,
            data: {
                ratings,
                stats: {
                    totalRatings: parseInt(stats.total_ratings) || 0,
                    averageScore: parseFloat(stats.average_score) || 0,
                    maxScore: stats.max_score || 0,
                    minScore: stats.min_score || 0,
                },
            },
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const updateRating = async (ratingId, ratingData) => {
    try {
        const { score, comment } = ratingData;

        if (!ratingId) {
            throw new Error('El ratingId es obligatorio');
        }

        if (score && (score < 1 || score > 5 || !Number.isInteger(score))) {
            throw new Error('El score debe ser un número entero entre 1 y 5');
        }

        const rating = await ratingModel.updateRating(ratingId, ratingData);
        return { success: true, data: rating };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const deleteRating = async (ratingId) => {
    try {
        if (!ratingId) {
            throw new Error('El ratingId es obligatorio');
        }

        const rating = await ratingModel.deleteRating(ratingId);
        return { success: true, data: rating };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    createRating,
    getRatingsByProduct,
    updateRating,
    deleteRating,
};
