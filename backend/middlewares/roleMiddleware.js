const authConfig = require('../config/authConfig');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const role = req.user.role;

        if (!authConfig.allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: 'Role not allowed'
            });
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient role privileges'
            });
        }

        next();
    };
};

module.exports = authorize;
