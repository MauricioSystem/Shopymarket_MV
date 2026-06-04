const express = require('express');
const router = express.Router();
const {
    getStoreRating,
    saveStoreRating,
    getServiceProfileRating,
    saveServiceProfileRating,
    getProductVotes,
    saveProductVote,
    deleteProductVote,
} = require('../../controllers/rating/ratingControllers');
const { authenticate } = require('../../middlewares');

const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }
    return authenticate(req, res, next);
};

router.get('/stores/:storeId', optionalAuthenticate, getStoreRating);
router.get('/service-profiles/:profileId', optionalAuthenticate, getServiceProfileRating);
router.get('/products/:productId/votes', optionalAuthenticate, getProductVotes);

router.use(authenticate);
router.put('/stores/:storeId', saveStoreRating);
router.put('/service-profiles/:profileId', saveServiceProfileRating);
router.put('/products/:productId/vote', saveProductVote);
router.delete('/products/:productId/vote', deleteProductVote);

module.exports = router;
