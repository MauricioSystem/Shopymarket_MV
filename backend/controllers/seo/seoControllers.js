const seoService = require('../../services/seoServices/seoServices');

const getSeoOverview = async (req, res) => {
    try {
        const result = await seoService.getSeoOverview();
        return res.status(200).json({
            success: true,
            data: result,
            message: 'SEO overview retrieved successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving SEO overview',
            error: error.message,
        });
    }
};

const getSeoMeta = async (req, res) => {
    try {
        const result = await seoService.buildMetaForPath(req.query.path || '/home');
        return res.status(200).json({
            success: true,
            data: result,
            message: 'SEO metadata retrieved successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving SEO metadata',
            error: error.message,
        });
    }
};

const getSitemap = async (req, res) => {
    try {
        const sitemap = await seoService.getSitemapXml();
        res.type('application/xml');
        return res.status(200).send(sitemap);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error generating sitemap',
            error: error.message,
        });
    }
};

const getRobots = (req, res) => {
    res.type('text/plain');
    return res.status(200).send(seoService.buildRobotsTxt());
};

module.exports = {
    getSeoOverview,
    getSeoMeta,
    getSitemap,
    getRobots,
};
