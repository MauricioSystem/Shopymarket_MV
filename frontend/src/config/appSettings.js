const activeEnvironment = import.meta.env.VITE_APP_ENVIRONMENT || "local";

const environments = {
    local: {
        siteUrl: "http://localhost:5173",
        apiUrl: "http://localhost:3000",
    },
    docker: {
        // En Docker, Nginx hace proxy de /api/ → backend:3000
        // Por eso la URL del API queda vacía (ruta relativa)
        siteUrl: import.meta.env.VITE_SITE_URL || "",
        apiUrl: import.meta.env.VITE_API_URL || "",
    },
    production: {
        siteUrl: import.meta.env.VITE_SITE_URL || "https://www.shopymarketmv.com",
        apiUrl: import.meta.env.VITE_API_URL || "https://api.shopymarketmv.com",
    },
};

const currentSettings = environments[activeEnvironment] || environments.local;

export const APP_ENVIRONMENT = activeEnvironment;
export const SITE_BASE_URL = currentSettings.siteUrl.replace(/\/$/, "");
export const API_BASE_URL = currentSettings.apiUrl.replace(/\/$/, "");
