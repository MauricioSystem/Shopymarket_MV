const ratingService = require('../../services/ratingServices/ratingServices');

const createRating = async (req, res) => {
    try {
        const { product_id, score, comment } = req.body;
        const user_id = req.user.id;

        const result = await ratingService.createRating({
            product_id,
            user_id,
            score,
            comment,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(201).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getRatingsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await ratingService.getRatingsByProduct(productId);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateRating = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const { score, comment } = req.body;

        const result = await ratingService.updateRating(ratingId, { score, comment });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteRating = async (req, res) => {
    try {
        const { ratingId } = req.params;

        const result = await ratingService.deleteRating(ratingId);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ message: 'Rating eliminado', data: result.data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRating,
    getRatingsByProduct,
    updateRating,
    deleteRating,
};
