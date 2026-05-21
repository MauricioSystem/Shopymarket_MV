const validateUserId = (userId) => {
    if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID');
    }
    return true;
};

module.exports = validateUserId;
