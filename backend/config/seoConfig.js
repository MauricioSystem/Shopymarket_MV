const SITE_NAME = 'ShopyMarket';
const { siteUrl, apiUrl } = require('./appSettings');

const defaultDescription =
    'ShopyMarket conecta clientes con tiendas, productos y servicios locales en un solo mercado digital.';

const defaultKeywords = [
    'ShopyMarket',
    'Shopy Market',
    'marketplace local',
    'tiendas online',
    'productos locales',
    'servicios locales',
    'compras online',
    'comercio digital',
    'emprendimientos',
    'Bolivia',
    'La Paz',
    'ecommerce',
    'delivery',
    'catalogo digital',
    'vendedores locales',
];

const priorityKeywords = [
    'comprar productos locales online',
    'marketplace de tiendas y servicios',
    'tiendas y servicios en Bolivia',
    'catalogo online para negocios',
    'servicios profesionales locales',
];

const internalLinks = [
    { label: 'Inicio', path: '/home', priority: 1.0 },
    { label: 'Mercado', path: '/market', priority: 0.95 },
    { label: 'Crear cuenta', path: '/register', priority: 0.5 },
    { label: 'Iniciar sesion', path: '/login', priority: 0.35, noindex: true },
];

const blockedPaths = [
    '/api/',
    '/dashboard',
    '/cart',
    '/my-orders',
    '/profile',
];

module.exports = {
    SITE_NAME,
    siteUrl,
    apiUrl,
    defaultDescription,
    defaultKeywords,
    priorityKeywords,
    internalLinks,
    blockedPaths,
};
