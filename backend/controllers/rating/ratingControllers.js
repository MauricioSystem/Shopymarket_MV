const ratingService = require('../../services/ratingServices/ratingServices');

const getStoreRating = async (req, res) => {
    try {
        const result = await ratingService.getTargetRating({
            targetType: 'store',
            targetId: req.params.storeId,
            userId: req.user?.id,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const saveStoreRating = async (req, res) => {
    try {
        const result = await ratingService.saveTargetRating({
            targetType: 'store',
            targetId: req.params.storeId,
            userId: req.user?.id,
            userRole: req.user?.role,
            rating: req.body.rating,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(201).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getServiceProfileRating = async (req, res) => {
    try {
        const result = await ratingService.getTargetRating({
            targetType: 'service_profile',
            targetId: req.params.profileId,
            userId: req.user?.id,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const saveServiceProfileRating = async (req, res) => {
    try {
        const result = await ratingService.saveTargetRating({
            targetType: 'service_profile',
            targetId: req.params.profileId,
            userId: req.user?.id,
            userRole: req.user?.role,
            rating: req.body.rating,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(201).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getProductVotes = async (req, res) => {
    try {
        const result = await ratingService.getProductVotes({
            productId: req.params.productId,
            userId: req.user?.id,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const saveProductVote = async (req, res) => {
    try {
        const result = await ratingService.saveProductVote({
            productId: req.params.productId,
            userId: req.user?.id,
            userRole: req.user?.role,
            vote: req.body.vote,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(201).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteProductVote = async (req, res) => {
    try {
        const result = await ratingService.deleteProductVote({
            productId: req.params.productId,
            userId: req.user?.id,
            userRole: req.user?.role,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getStoreRating,
    saveStoreRating,
    getServiceProfileRating,
    saveServiceProfileRating,
    getProductVotes,
    saveProductVote,
    deleteProductVote,
};
