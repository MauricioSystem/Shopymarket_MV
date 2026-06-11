// ─── Base URL ────────────────────────────────────────────────────────────────
import { API_BASE_URL } from "@/config/appSettings";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, { token, method = 'GET', body } = {}) {
    const isFormData = body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
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

// ─── Public read endpoints (no auth required) ─────────────────────────────────
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

// ─── Vendor helpers (client-side filtering, no new backend endpoints) ─────────

/**
 * Fetches the store owned by the given user by filtering GET /api/stores
 * client-side using admin_user_id. Returns the first matching store or null.
 */
export async function getStoreByUserId(token, userId) {
    const result = await getAllStores(token);
    const stores = Array.isArray(result?.data) ? result.data : [];
    return stores.find((s) => String(s.admin_user_id) === String(userId)) ?? null;
}

/**
 * Fetches the service profile owned by the given user by filtering
 * GET /api/service-profiles client-side. Returns the first match or null.
 */
export async function getServiceProfileByUserId(token, userId) {
    const result = await getAllServiceProfiles(token);
    const profiles = Array.isArray(result?.data) ? result.data : [];
    return profiles.find((p) => String(p.admin_user_id) === String(userId)) ?? null;
}

// ─── Store CRUD ───────────────────────────────────────────────────────────────
export async function createStore(token, payload) {
    return apiFetch('/api/stores', { token, method: 'POST', body: payload });
}

/** Update a store by ID. Calls PUT /api/stores/:id — existing backend endpoint. */
export async function updateMyStore(token, storeId, payload) {
    return apiFetch(`/api/stores/${storeId}`, { token, method: 'PUT', body: payload });
}

export async function deleteStore(token, storeId) {
    return apiFetch(`/api/stores/${storeId}`, { token, method: 'DELETE' });
}

// ─── Service profile CRUD ─────────────────────────────────────────────────────
export async function createServiceProfile(token, payload) {
    return apiFetch('/api/service-profiles', { token, method: 'POST', body: payload });
}

export async function updateServiceProfile(token, profileId, payload) {
    return apiFetch(`/api/service-profiles/${profileId}`, { token, method: 'PUT', body: payload });
}

export async function deleteServiceProfile(token, profileId) {
    return apiFetch(`/api/service-profiles/${profileId}`, { token, method: 'DELETE' });
}

export async function createService(token, payload) {
    return apiFetch('/api/services', { token, method: 'POST', body: payload });
}

export async function updateService(token, serviceId, payload) {
    return apiFetch(`/api/services/${serviceId}`, { token, method: 'PUT', body: payload });
}

export async function deleteService(token, serviceId) {
    return apiFetch(`/api/services/${serviceId}`, { token, method: 'DELETE' });
}

// ─── Product CRUD ─────────────────────────────────────────────────────────────
export async function createProduct(token, payload) {
    return apiFetch('/api/products', { token, method: 'POST', body: payload });
}

export async function updateProduct(token, productId, payload) {
    return apiFetch(`/api/products/${productId}`, { token, method: 'PUT', body: payload });
}

export async function deleteProduct(token, productId) {
    return apiFetch(`/api/products/${productId}`, { token, method: 'DELETE' });
}

// ─── Category / Subcategory CRUD ──────────────────────────────────────────────
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

// ─── Ratings ─────────────────────────────────────────────────────────────────
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
