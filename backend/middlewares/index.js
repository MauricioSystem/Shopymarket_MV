const authenticate = require('./authMiddleware');
const authorize = require('./roleMiddleware');

module.exports = {
    authenticate,
    authorize
};
