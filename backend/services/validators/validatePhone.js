const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneRegex.test(phone)) {
        throw new Error('Phone number can only contain digits, spaces, +, -, and parentheses');
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
        throw new Error('Phone number must have at least 7 digits');
    }
    return true;
};

module.exports = validatePhone;
