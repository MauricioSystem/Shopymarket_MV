const validateEmail = (email) => {
    const gmailVariants = ['gmail.com', 'googlemail.com'];
    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailLower)) {
        throw new Error('Invalid email format');
    }

    const domain = emailLower.split('@')[1];
    if (!gmailVariants.includes(domain)) {
        throw new Error('Email must use gmail.com or googlemail.com domain');
    }

    return true;
};

module.exports = validateEmail;
