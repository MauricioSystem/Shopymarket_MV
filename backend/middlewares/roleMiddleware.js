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

const authorizeProfileUpdate = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = parseInt(req.user.id, 10);
    const userRole = req.user.role;

    if (userRole === 'super_admin') {
        return next();
    }

    if (currentUserId === targetUserId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'You can only edit your own profile'
    });
};

module.exports = {
    authorize,
    authorizeProfileUpdate
};
