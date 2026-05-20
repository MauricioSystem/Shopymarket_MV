const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig');

const authenticate = (req, res, next) => {
    const authHeader = req.headers[authConfig.authHeader];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Provide a valid Bearer token.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === 'TokenExpiredError'
                ? 'Session expired. Please log in again.'
                : 'Invalid token. Authentication failed.'
        });
    }
};

module.exports = authenticate;

