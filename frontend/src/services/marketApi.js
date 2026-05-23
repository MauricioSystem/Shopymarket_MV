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

export async function getAllStores(token) {
    return apiFetch('/api/stores', { token });
}

export async function getAllServiceProfiles(token) {
    return apiFetch('/api/service-profiles', { token });
}

export async function getAllCategories(token) {
    return apiFetch('/api/categories', { token });
}

export async function getAllSubcategories(token) {
    return apiFetch('/api/subcategories', { token });
}

export async function getAllServices(token) {
    return apiFetch('/api/services', { token });
}

export async function getAllProducts(token) {
    return apiFetch('/api/products', { token });
}

export async function createStore(token, payload) {
    return apiFetch('/api/stores', { token, method: 'POST', body: payload });
}

export async function createServiceProfile(token, payload) {
    return apiFetch('/api/service-profiles', { token, method: 'POST', body: payload });
}

export async function createService(token, payload) {
    return apiFetch('/api/services', { token, method: 'POST', body: payload });
}

export async function createProduct(token, payload) {
    return apiFetch('/api/products', { token, method: 'POST', body: payload });
}

export async function createSubcategory(token, payload) {
    return apiFetch('/api/subcategories', { token, method: 'POST', body: payload });
}

export async function createCategory(token, payload) {
    return apiFetch('/api/categories', { token, method: 'POST', body: payload });
}

export async function updateCategory(token, id, payload) {
    return apiFetch(`/api/categories/${id}`, { token, method: 'PUT', body: payload });
}

export async function deleteCategory(token, id) {
    return apiFetch(`/api/categories/${id}`, { token, method: 'DELETE' });
}

// Ratings API
export async function getRatingsByProduct(productId) {
    return apiFetch(`/api/ratings/${productId}`, {});
}

export async function createProductRating(token, payload) {
    return apiFetch('/api/ratings', { token, method: 'POST', body: payload });
}

export async function updateProductRating(token, ratingId, payload) {
    return apiFetch(`/api/ratings/${ratingId}`, { token, method: 'PUT', body: payload });
}

export async function deleteProductRating(token, ratingId) {
    return apiFetch(`/api/ratings/${ratingId}`, { token, method: 'DELETE' });
}
