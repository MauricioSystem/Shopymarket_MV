const authenticate = require('./authMiddleware');
const { authorize, authorizeProfileUpdate } = require('./roleMiddleware');

module.exports = {
    authenticate,
    authorize,
    authorizeProfileUpdate
};
