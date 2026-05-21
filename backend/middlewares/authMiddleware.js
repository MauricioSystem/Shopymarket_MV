const authConfig = require('../config/authConfig');

const authenticate = (req, res, next) => {
    const authorization = req.headers[authConfig.authHeader];
    const userId = req.headers[authConfig.userIdHeader];
    const userRole = req.headers[authConfig.userRoleHeader];

    if (!userId || !userRole) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    req.user = {
        id: userId,
        role: userRole
    };
    next();
};

module.exports = authenticate;
