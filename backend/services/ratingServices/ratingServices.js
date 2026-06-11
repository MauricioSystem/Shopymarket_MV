const ratingModel = require('../../models/ratingModel');

const writableRoles = ['cliente'];

const assertCustomer = (role) => {
    if (!writableRoles.includes(role)) {
        throw new Error('Solo los usuarios pueden calificar o votar');
    }
};

const normalizeRating = (value) => {
    const rating = Number(value);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('La calificación debe ser un número entero entre 1 y 5');
    }
    return rating;
};

const normalizeVote = (value) => {
    const vote = Number(value);
    if (![1, -1].includes(vote)) {
        throw new Error('El voto debe ser 1 o -1');
    }
    return vote;
};

const getTargetRating = async ({ targetType, targetId, userId }) => {
    try {
        if (!targetId) {
            throw new Error('El identificador es obligatorio');
        }

        const data = await ratingModel.getRatingStats(targetType, targetId, userId);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const saveTargetRating = async ({ targetType, targetId, userId, userRole, rating }) => {
    try {
        if (!targetId || !userId) {
            throw new Error('El identificador y el usuario son obligatorios');
        }

        assertCustomer(userRole);
        const normalizedRating = normalizeRating(rating);
        const saved = await ratingModel.upsertRating({
            targetType,
            targetId,
            userId,
            rating: normalizedRating,
        });
        const stats = await ratingModel.getRatingStats(targetType, targetId, userId);

        return { success: true, data: { rating: saved, stats } };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const getVotes = async ({ targetType, targetId, userId }) => {
    try {
        if (!targetId) {
            throw new Error('El identificador es obligatorio');
        }

        const data = await ratingModel.getVoteStats(targetType, targetId, userId);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const saveVote = async ({ targetType, targetId, userId, userRole, vote }) => {
    try {
        if (!targetId || !userId) {
            throw new Error('El identificador y el usuario son obligatorios');
        }

        assertCustomer(userRole);
        const normalizedVote = normalizeVote(vote);
        const saved = await ratingModel.upsertVote({
            targetType,
            targetId,
            userId,
            vote: normalizedVote,
        });
        const stats = await ratingModel.getVoteStats(targetType, targetId, userId);

        return { success: true, data: { vote: saved, stats } };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const deleteVote = async ({ targetType, targetId, userId, userRole }) => {
    try {
        if (!targetId || !userId) {
            throw new Error('El identificador y el usuario son obligatorios');
        }

        assertCustomer(userRole);
        const deleted = await ratingModel.deleteVote(targetType, targetId, userId);
        const stats = await ratingModel.getVoteStats(targetType, targetId, userId);

        return { success: true, data: { vote: deleted, stats } };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    getTargetRating,
    saveTargetRating,
    getVotes,
    saveVote,
    deleteVote,
};
