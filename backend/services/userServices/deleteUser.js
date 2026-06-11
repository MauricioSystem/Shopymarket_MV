const userModel = require('../../models/userModel');
const { validateUserId } = require('../validators');

const deleteUser = async (userId, requester = {}) => {
    try {
        validateUserId(userId);

        if (String(requester.id) !== String(userId)) {
            throw new Error('Solo puedes eliminar tu propia cuenta');
        }

        if (requester.role !== 'cliente') {
            throw new Error('Solo los usuarios clientes pueden eliminar su cuenta');
        }

        const user = await userModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const roles = await userModel.getUserRoles(userId);
        const isCustomer = roles.some((role) => role.name === 'cliente');
        if (!isCustomer || roles.some((role) => role.name !== 'cliente')) {
            throw new Error('Solo los usuarios clientes pueden eliminar su cuenta');
        }

        const [pendingOrders, storeCount, serviceProfileCount] = await Promise.all([
            userModel.countBlockingOrdersByUserId(userId),
            userModel.countStoresByUserId(userId),
            userModel.countServiceProfilesByUserId(userId),
        ]);

        if (pendingOrders > 0) {
            throw new Error('No puedes eliminar tu cuenta porque tienes pedidos pendientes');
        }

        if (storeCount > 0 || serviceProfileCount > 0) {
            throw new Error('No puedes eliminar tu cuenta porque tienes una tienda o servicio registrado');
        }

        const deletedUser = await userModel.deleteUser(userId);

        return {
            success: true,
            data: deletedUser,
            message: 'User deleted successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deleting user',
            error: error.message
        };
    }
};

module.exports = deleteUser;
