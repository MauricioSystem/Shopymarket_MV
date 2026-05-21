const userModel = require('../../models/userModel');
const crypto = require('crypto');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await userModel.getUserByEmail(email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (passwordHash !== user.password_hash) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        delete user.password_hash;

        return res.status(200).json({
            success: true,
            data: user,
            message: 'Login successful'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Login error',
            error: error.message
        });
    }
};

module.exports = login;
