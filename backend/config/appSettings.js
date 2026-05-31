const activeEnvironment = 'local';

const environments = {
    local: {
        siteUrl: 'http://localhost:5173',
        apiUrl: 'http://localhost:3000',
    },
    production: {
        siteUrl: 'https://tu-dominio.com',
        apiUrl: 'https://api.tu-dominio.com',
    },
};

const currentSettings = environments[activeEnvironment] || environments.local;

module.exports = {
    activeEnvironment,
    siteUrl: currentSettings.siteUrl.replace(/\/$/, ''),
    apiUrl: currentSettings.apiUrl.replace(/\/$/, ''),
};
