const validatePassword = (password) => {
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }
    return true;
};

module.exports = validatePassword;
