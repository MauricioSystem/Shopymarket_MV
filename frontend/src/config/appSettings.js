const activeEnvironment = "local";

const environments = {
    local: {
        siteUrl: "http://localhost:5173",
        apiUrl: "http://localhost:3000",
    },
    production: {
        siteUrl: "https://tu-dominio.com",
        apiUrl: "https://api.tu-dominio.com",
    },
};

const currentSettings = environments[activeEnvironment] || environments.local;

export const APP_ENVIRONMENT = activeEnvironment;
export const SITE_BASE_URL = currentSettings.siteUrl.replace(/\/$/, "");
export const API_BASE_URL = currentSettings.apiUrl.replace(/\/$/, "");
