const userService = require('../../services/userServices');

const requestCode = async (req, res) => {
    try {
        const result = await userService.reactivateUser.requestReactivationCode(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('[Reactivate request]', error.error || error.message || error);
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const verifyCode = async (req, res) => {
    try {
        const result = await userService.reactivateUser.verifyReactivationCode(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('[Reactivate verify]', error.error || error.message || error);
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const resetPassword = async (req, res) => {
    try {
        const result = await userService.reactivateUser.resetPasswordAndReactivate(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('[Reactivate password]', error.error || error.message || error);
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = {
    requestCode,
    verifyCode,
    resetPassword,
};
