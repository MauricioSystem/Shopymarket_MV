import { normalizeFrontendRole } from "@/utils/authRoles";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const parseEndpointList = (value, fallback) => {
    if (!value) {
        return fallback;
    }

    const list = String(value)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

    return list.length > 0 ? list : fallback;
};

const LOGIN_ENDPOINTS = parseEndpointList(
    import.meta.env.VITE_AUTH_LOGIN_PATHS,
    ['/api/auth/login', '/auth/login', '/login'],
);

const REGISTER_ENDPOINTS = parseEndpointList(
    import.meta.env.VITE_AUTH_REGISTER_PATHS,
    ['/api/auth/register', '/auth/register', '/register'],
);

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const toErrorMessage = (payload, fallback) => {
    if (!payload) {
        return fallback;
    }

    if (typeof payload === 'string') {
        return payload;
    }

    return payload.message || payload.error || payload.detail || fallback;
};

async function readResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    try {
        return await response.text();
    } catch {
        return null;
    }
}

async function requestJson(path, { method = 'POST', body, token } = {}) {
    const response = await fetch(buildUrl(path), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await readResponseBody(response);

    return {
        ok: response.ok,
        status: response.status,
        endpoint: path,
        data,
    };
}

async function requestWithFallback(endpoints, payload) {
    let lastNetworkError = null;

    for (const endpoint of endpoints) {
        try {
            const response = await requestJson(endpoint, payload);

            if (response.ok) {
                return response;
            }

            if (![404, 405].includes(response.status)) {
                const error = new Error(toErrorMessage(response.data, 'No fue posible completar la autenticación.'));
                error.status = response.status;
                error.payload = response.data;
                error.endpoint = endpoint;
                throw error;
            }
        } catch (error) {
            if (typeof error?.status === 'number' && ![404, 405].includes(error.status)) {
                throw error;
            }

            lastNetworkError = error;
        }
    }

    if (lastNetworkError) {
        throw lastNetworkError;
    }

    throw new Error('Correo o contraseña incorrectos.');
}

const normalizeRole = (value) => {
    if (!value) {
        return null;
    }
    const raw = Array.isArray(value) ? value[0] : value;
    return normalizeFrontendRole(raw);
};

const pickUserObject = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    return payload.user || payload.account || payload.profile
        || payload.data?.user || payload.data?.account || payload.data?.profile
        || payload.data || null;
};

const normalizeAuthPayload = (envelope) => {
    const rawPayload = envelope?.data ?? envelope ?? null;
    const user = pickUserObject(rawPayload);

    const tokenSource = [
        rawPayload?.token,
        rawPayload?.accessToken,
        rawPayload?.jwt,
        rawPayload?.access_token,
        rawPayload?.data?.token,      
        rawPayload?.data?.user?.token,
        rawPayload?.data?.accessToken,
        rawPayload?.result?.token,
        user?.token,    
    ].find(Boolean);

    const roleSource = [
        rawPayload?.data?.role,  
        rawPayload?.data?.user?.role,
        user?.role,
        user?.rol,
        rawPayload?.role,
        rawPayload?.rol,
        rawPayload?.user_role,
        rawPayload?.data?.rol,
        user?.roles?.[0]?.name,
    ].find(Boolean);

    const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();

    return {
        token: tokenSource || null,
        role: normalizeRole(roleSource),
        user: user && typeof user === 'object'
            ? {
                ...user,
                displayName: displayName || user.name || user.full_name || user.email || 'Usuario Shopy Market',
            }
            : null,
        raw: rawPayload,
        endpoint: envelope?.endpoint || null,
        status: envelope?.status || null,
    };
};


export async function loginRequest(credentials) {
    const response = await requestWithFallback(LOGIN_ENDPOINTS, {
        body: credentials,
    });

    return normalizeAuthPayload(response);
}

export async function registerRequest(payload) {
    const response = await requestWithFallback(REGISTER_ENDPOINTS, {
        body: payload,
    });

    return normalizeAuthPayload(response);
}

export { normalizeAuthPayload, normalizeRole };