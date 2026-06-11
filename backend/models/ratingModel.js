const pool = require('../src/db/database');

const ratingTarget = {
    store: {
        column: 'store_id',
        table: 'stores',
    },
    service_profile: {
        column: 'service_profile_id',
        table: 'service_profiles',
    },
};

const voteTarget = {
    product: {
        idName: 'productId',
        column: 'product_id',
        votesTable: 'product_votes',
        targetTable: 'products',
    },
    service: {
        idName: 'serviceId',
        column: 'service_id',
        votesTable: 'service_votes',
        targetTable: 'services',
    },
};

const getTargetConfig = (targetType) => {
    const config = ratingTarget[targetType];
    if (!config) {
        throw new Error('Tipo de calificación no válido');
    }
    return config;
};

const getVoteConfig = (targetType) => {
    const config = voteTarget[targetType];
    if (!config) {
        throw new Error('Tipo de voto no válido');
    }
    return config;
};

const ratingWhereClause = (column) => `
    ${column} = $1
    AND product_id IS NULL
    AND service_id IS NULL
    AND ${column === 'store_id' ? 'service_profile_id' : 'store_id'} IS NULL
`;

const getRatingStats = async (targetType, targetId, userId) => {
    const { column } = getTargetConfig(targetType);
    const statsResult = await pool.query(
        `
        SELECT
            COUNT(*)::INTEGER AS rating_count,
            COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)::NUMERIC AS average_rating,
            COALESCE(ROUND((AVG(rating) / 5 * 100)::NUMERIC, 2), 0)::NUMERIC AS rating_percentage,
            jsonb_build_object(
                '5', COUNT(*) FILTER (WHERE rating = 5)::INTEGER,
                '4', COUNT(*) FILTER (WHERE rating = 4)::INTEGER,
                '3', COUNT(*) FILTER (WHERE rating = 3)::INTEGER,
                '2', COUNT(*) FILTER (WHERE rating = 2)::INTEGER,
                '1', COUNT(*) FILTER (WHERE rating = 1)::INTEGER
            ) AS rating_breakdown
        FROM reviews
        WHERE ${ratingWhereClause(column)}
        `,
        [targetId]
    );

    let userRating = null;
    if (userId) {
        const userResult = await pool.query(
            `
            SELECT id, rating
            FROM reviews
            WHERE ${ratingWhereClause(column)} AND user_id = $2
            LIMIT 1
            `,
            [targetId, userId]
        );
        userRating = userResult.rows[0] || null;
    }

    return {
        ...statsResult.rows[0],
        user_rating: userRating,
    };
};

const syncRatingStats = async (client, targetType, targetId) => {
    const { column, table } = getTargetConfig(targetType);
    await client.query(
        `
        UPDATE ${table}
        SET
            rating_count = stats.rating_count,
            average_rating = stats.average_rating,
            rating_percentage = stats.rating_percentage
        FROM (
            SELECT
                COUNT(*)::INTEGER AS rating_count,
                COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)::NUMERIC AS average_rating,
                COALESCE(ROUND((AVG(rating) / 5 * 100)::NUMERIC, 2), 0)::NUMERIC AS rating_percentage
            FROM reviews
            WHERE ${ratingWhereClause(column)}
        ) stats
        WHERE ${table}.id = $1
        `,
        [targetId]
    );
};

const upsertRating = async ({ targetType, targetId, userId, rating }) => {
    const { column } = getTargetConfig(targetType);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const current = await client.query(
            `
            SELECT id
            FROM reviews
            WHERE ${ratingWhereClause(column)} AND user_id = $2
            LIMIT 1
            `,
            [targetId, userId]
        );

        let saved;
        if (current.rows[0]) {
            const updated = await client.query(
                `
                UPDATE reviews
                SET rating = $1
                WHERE id = $2
                RETURNING *
                `,
                [rating, current.rows[0].id]
            );
            saved = updated.rows[0];
        } else {
            const inserted = await client.query(
                `
                INSERT INTO reviews (user_id, ${column}, rating)
                VALUES ($1, $2, $3)
                RETURNING *
                `,
                [userId, targetId, rating]
            );
            saved = inserted.rows[0];
        }

        await syncRatingStats(client, targetType, targetId);
        await client.query('COMMIT');
        return saved;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getVoteStats = async (targetType, targetId, userId) => {
    const { column, votesTable } = getVoteConfig(targetType);
    const statsResult = await pool.query(
        `
        SELECT
            COALESCE(SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END), 0)::INTEGER AS like_count,
            COALESCE(SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END), 0)::INTEGER AS dislike_count,
            COALESCE(SUM(vote), 0)::INTEGER AS vote_score
        FROM ${votesTable}
        WHERE ${column} = $1
        `,
        [targetId]
    );

    let userVote = null;
    if (userId) {
        const userResult = await pool.query(
            `
            SELECT id, vote
            FROM ${votesTable}
            WHERE ${column} = $1 AND user_id = $2
            LIMIT 1
            `,
            [targetId, userId]
        );
        userVote = userResult.rows[0] || null;
    }

    return {
        ...statsResult.rows[0],
        user_vote: userVote,
    };
};

const syncVoteStats = async (client, targetType, targetId) => {
    const { column, votesTable, targetTable } = getVoteConfig(targetType);
    await client.query(
        `
        UPDATE ${targetTable}
        SET
            like_count = stats.like_count,
            dislike_count = stats.dislike_count,
            vote_score = stats.vote_score
        FROM (
            SELECT
                COALESCE(SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END), 0)::INTEGER AS like_count,
                COALESCE(SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END), 0)::INTEGER AS dislike_count,
                COALESCE(SUM(vote), 0)::INTEGER AS vote_score
            FROM ${votesTable}
            WHERE ${column} = $1
        ) stats
        WHERE ${targetTable}.id = $1
        `,
        [targetId]
    );
};

const upsertVote = async ({ targetType, targetId, userId, vote }) => {
    const { column, votesTable } = getVoteConfig(targetType);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const saved = await client.query(
            `
            INSERT INTO ${votesTable} (${column}, user_id, vote)
            VALUES ($1, $2, $3)
            ON CONFLICT (${column}, user_id)
            DO UPDATE SET vote = EXCLUDED.vote, updated_at = NOW()
            RETURNING *
            `,
            [targetId, userId, vote]
        );
        await syncVoteStats(client, targetType, targetId);
        await client.query('COMMIT');
        return saved.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const deleteVote = async (targetType, targetId, userId) => {
    const { column, votesTable } = getVoteConfig(targetType);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await client.query(
            `
            DELETE FROM ${votesTable}
            WHERE ${column} = $1 AND user_id = $2
            RETURNING *
            `,
            [targetId, userId]
        );
        await syncVoteStats(client, targetType, targetId);
        await client.query('COMMIT');
        return result.rows[0] || null;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getRatingStats,
    upsertRating,
    getVoteStats,
    upsertVote,
    deleteVote,
};
