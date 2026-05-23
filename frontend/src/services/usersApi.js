const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

async function apiFetch(path, { token, method = 'GET', body } = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.error || data?.message || `Error ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.payload = data;
        throw err;
    }

    return data;
}

export async function getAllUsers(token) {
    return apiFetch('/api/users', { token });
}

export async function getUserById(token, userId) {
    return apiFetch(`/api/users/${userId}`, { token });
}

export async function updateUserProfile(token, userId, userData) {
    return apiFetch(`/api/users/${userId}`, {
        token,
        method: 'PUT',
        body: userData,
    });
}

export async function createUser(token, userData) {
    return apiFetch('/api/users', {
        token,
        method: 'POST',
        body: userData,
    });
}

export async function deleteUser(token, userId) {
    return apiFetch(`/api/users/${userId}`, {
        token,
        method: 'DELETE',
    });
}

export async function updateUserProfileMultipart(token, userId, formData) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.error || data?.message || `Error ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.payload = data;
        throw err;
    }

    return data;
}

