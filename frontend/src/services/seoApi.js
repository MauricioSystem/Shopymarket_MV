import { API_BASE_URL } from "@/config/appSettings";

export async function getSeoMeta(pathname, options = {}) {
    const path = pathname || '/home';
    const response = await fetch(`${API_BASE_URL}/api/seo/meta?path=${encodeURIComponent(path)}`, {
        signal: options.signal,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.error || data?.message || `Error ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.payload = data;
        throw err;
    }

    return data?.data;
}
