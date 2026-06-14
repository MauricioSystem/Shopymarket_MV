const activeEnvironment = process.env.APP_ENVIRONMENT || 'local';

const environments = {
    local: {
        siteUrl: 'http://localhost:5173',
        apiUrl: 'http://localhost:3000',
    },
    docker: {
        siteUrl: process.env.SITE_URL || 'http://localhost',
        apiUrl: process.env.API_URL || 'http://localhost/api',
    },
    production: {
        siteUrl: process.env.SITE_URL || 'https://www.shopymarketmv.com',
        apiUrl: process.env.API_URL || 'https://api.shopymarketmv.com',
    },
};

const currentSettings = environments[activeEnvironment] || environments.local;

module.exports = {
    activeEnvironment,
    siteUrl: currentSettings.siteUrl.replace(/\/$/, ''),
    apiUrl: currentSettings.apiUrl.replace(/\/$/, ''),
};
