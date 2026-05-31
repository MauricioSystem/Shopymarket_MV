const express = require('express');
const {
    getSeoOverview,
    getSeoMeta,
} = require('../../controllers/seo/seoControllers');

const router = express.Router();

router.get('/', getSeoOverview);
router.get('/meta', getSeoMeta);

module.exports = router;
