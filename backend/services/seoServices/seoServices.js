const pool = require('../../src/db/database');
const {
    SITE_NAME,
    siteUrl,
    apiUrl,
    defaultDescription,
    defaultKeywords,
    priorityKeywords,
    internalLinks,
    blockedPaths,
} = require('../../config/seoConfig');

const CHANGE_FREQ = {
    home: 'weekly',
    market: 'daily',
    detail: 'weekly',
};

const escapeXml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const normalizeText = (value = '') => String(value).trim().replace(/\s+/g, ' ');

const absoluteUrl = (path = '/') => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

const imageUrl = (value) => {
    if (!value) return null;
    return value.startsWith('http') ? value : `${apiUrl}${value}`;
};

const routeParam = (value) => encodeURIComponent(normalizeText(value));

const uniqueKeywords = (items) => {
    const seen = new Set();
    return items
        .map(normalizeText)
        .filter(Boolean)
        .filter((item) => {
            const key = item.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const getSeoEntities = async () => {
    const [stores, products, services, serviceProfiles, categories] = await Promise.all([
        pool.query(`
            SELECT id, name, description, logo_url, banner_url, city, country, created_at
            FROM stores
            WHERE COALESCE(status, 'active') <> 'inactive'
            ORDER BY created_at DESC
        `),
        pool.query(`
            SELECT id, name, description, image_url, price, created_at
            FROM products
            WHERE COALESCE(status, 'active') <> 'inactive'
            ORDER BY created_at DESC
        `),
        pool.query(`
            SELECT id, name, description, image_url, price, estimated_time, created_at
            FROM services
            WHERE COALESCE(status, 'active') <> 'inactive'
            ORDER BY created_at DESC
        `),
        pool.query(`
            SELECT id, name, description, profile_image_url, banner_url, city, country, created_at
            FROM service_profiles
            WHERE COALESCE(status, 'active') <> 'inactive'
            ORDER BY created_at DESC
        `),
        pool.query(`
            SELECT id, name, type
            FROM categories
            WHERE COALESCE(status, 'active') <> 'inactive'
            ORDER BY name
        `),
    ]);

    return {
        stores: stores.rows,
        products: products.rows,
        services: services.rows,
        serviceProfiles: serviceProfiles.rows,
        categories: categories.rows,
    };
};

const buildKeywordStrategy = ({ stores, products, services, serviceProfiles, categories }) => {
    const entityKeywords = [
        ...stores.flatMap((store) => [store.name, store.city, store.country, `${store.name} tienda online`]),
        ...serviceProfiles.flatMap((profile) => [profile.name, profile.city, profile.country, `${profile.name} servicios`]),
        ...products.flatMap((product) => [product.name, `${product.name} online`, `${product.name} precio`]),
        ...services.flatMap((service) => [service.name, `${service.name} servicio`, `${service.name} precio`]),
        ...categories.flatMap((category) => [category.name, `${category.name} en ${SITE_NAME}`]),
    ];

    return {
        brand: [SITE_NAME, 'Shopy Market'],
        primary: priorityKeywords,
        longTail: uniqueKeywords(entityKeywords).slice(0, 80),
        all: uniqueKeywords([...defaultKeywords, ...priorityKeywords, ...entityKeywords]).slice(0, 140),
    };
};

const buildSitemapUrls = ({ stores, products, services, serviceProfiles }) => {
    const now = new Date().toISOString();
    const staticUrls = internalLinks
        .filter((link) => !link.noindex)
        .map((link) => ({
            loc: absoluteUrl(link.path),
            changefreq: link.path === '/market' ? CHANGE_FREQ.market : CHANGE_FREQ.home,
            priority: link.priority,
            lastmod: now,
        }));

    const storeUrls = stores.map((store) => ({
        loc: absoluteUrl(`/store/${routeParam(store.name || store.id)}`),
        changefreq: CHANGE_FREQ.detail,
        priority: 0.85,
        lastmod: new Date(store.created_at || now).toISOString(),
        image: imageUrl(store.banner_url || store.logo_url),
    }));

    const serviceProfileUrls = serviceProfiles.map((profile) => ({
        loc: absoluteUrl(`/service/${routeParam(profile.name || profile.id)}`),
        changefreq: CHANGE_FREQ.detail,
        priority: 0.82,
        lastmod: new Date(profile.created_at || now).toISOString(),
        image: imageUrl(profile.banner_url || profile.profile_image_url),
    }));

    const productUrls = products.map((product) => ({
        loc: absoluteUrl(`/product/${product.id}`),
        changefreq: CHANGE_FREQ.detail,
        priority: 0.78,
        lastmod: new Date(product.created_at || now).toISOString(),
        image: imageUrl(product.image_url),
    }));

    const serviceUrls = services.map((service) => ({
        loc: absoluteUrl(`/service-detail/${service.id}`),
        changefreq: CHANGE_FREQ.detail,
        priority: 0.76,
        lastmod: new Date(service.created_at || now).toISOString(),
        image: imageUrl(service.image_url),
    }));

    return [...staticUrls, ...storeUrls, ...serviceProfileUrls, ...productUrls, ...serviceUrls];
};

const buildSitemapXml = (urls) => {
    const entries = urls.map((url) => {
        const imageTag = url.image
            ? `
        <image:image>
            <image:loc>${escapeXml(url.image)}</image:loc>
        </image:image>`
            : '';

        return `
    <url>
        <loc>${escapeXml(url.loc)}</loc>
        <lastmod>${escapeXml(url.lastmod)}</lastmod>
        <changefreq>${escapeXml(url.changefreq)}</changefreq>
        <priority>${Number(url.priority).toFixed(2)}</priority>${imageTag}
    </url>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries}
</urlset>`;
};

const buildRobotsTxt = () => {
    const disallowRules = blockedPaths.map((path) => `Disallow: ${path}`).join('\n');

    return [
        'User-agent: *',
        'Allow: /',
        disallowRules,
        `Sitemap: ${apiUrl}/sitemap.xml`,
        `Host: ${siteUrl}`,
        '',
    ].join('\n');
};

const buildMetaForPath = async (path = '/home') => {
    const { stores, products, services, serviceProfiles, categories } = await getSeoEntities();
    const keywords = buildKeywordStrategy({ stores, products, services, serviceProfiles, categories });
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonical = absoluteUrl(cleanPath);
    const isBlockedPath = blockedPaths.some((blockedPath) => cleanPath.startsWith(blockedPath));

    let title = `${SITE_NAME} | Tiendas, productos y servicios locales`;
    let description = defaultDescription;
    let image = null;
    let type = 'website';

    const productMatch = cleanPath.match(/^\/product\/(\d+)/);
    const serviceMatch = cleanPath.match(/^\/service-detail\/(\d+)/);
    const storeMatch = cleanPath.match(/^\/store\/(.+)/);
    const serviceProfileMatch = cleanPath.match(/^\/service\/(.+)/);

    if (productMatch) {
        const product = products.find((item) => Number(item.id) === Number(productMatch[1]));
        if (product) {
            title = `${product.name} | ${SITE_NAME}`;
            description = product.description || `Compra ${product.name} en ${SITE_NAME}.`;
            image = imageUrl(product.image_url);
            type = 'product';
        }
    } else if (serviceMatch) {
        const service = services.find((item) => Number(item.id) === Number(serviceMatch[1]));
        if (service) {
            title = `${service.name} | Servicios en ${SITE_NAME}`;
            description = service.description || `Contrata ${service.name} desde ${SITE_NAME}.`;
            image = imageUrl(service.image_url);
            type = 'service';
        }
    } else if (storeMatch) {
        const storeSlug = decodeURIComponent(storeMatch[1]).toLowerCase();
        const store = stores.find((item) =>
            String(item.id) === storeSlug || normalizeText(item.name).toLowerCase() === storeSlug
        );
        if (store) {
            title = `${store.name} | Tienda en ${SITE_NAME}`;
            description = store.description || `Explora productos de ${store.name} en ${SITE_NAME}.`;
            image = imageUrl(store.banner_url || store.logo_url);
        }
    } else if (serviceProfileMatch) {
        const profileSlug = decodeURIComponent(serviceProfileMatch[1]).toLowerCase();
        const profile = serviceProfiles.find((item) =>
            String(item.id) === profileSlug || normalizeText(item.name).toLowerCase() === profileSlug
        );
        if (profile) {
            title = `${profile.name} | Servicios en ${SITE_NAME}`;
            description = profile.description || `Conoce los servicios de ${profile.name} en ${SITE_NAME}.`;
            image = imageUrl(profile.banner_url || profile.profile_image_url);
        }
    }

    return {
        title,
        description: normalizeText(description).slice(0, 160),
        canonical,
        robots: isBlockedPath ? 'noindex,nofollow' : 'index,follow',
        keywords: keywords.all,
        openGraph: {
            title,
            description: normalizeText(description).slice(0, 160),
            url: canonical,
            siteName: SITE_NAME,
            type,
            image,
        },
        links: internalLinks.map((link) => ({
            ...link,
            url: absoluteUrl(link.path),
        })),
    };
};

const getSeoOverview = async () => {
    const entities = await getSeoEntities();
    const keywords = buildKeywordStrategy(entities);

    return {
        siteName: SITE_NAME,
        siteUrl,
        apiUrl,
        description: defaultDescription,
        keywords,
        internalLinks: internalLinks.map((link) => ({
            ...link,
            url: absoluteUrl(link.path),
        })),
        totals: {
            stores: entities.stores.length,
            products: entities.products.length,
            services: entities.services.length,
            serviceProfiles: entities.serviceProfiles.length,
            categories: entities.categories.length,
        },
    };
};

const getSitemapXml = async () => {
    const entities = await getSeoEntities();
    return buildSitemapXml(buildSitemapUrls(entities));
};

module.exports = {
    getSeoOverview,
    buildMetaForPath,
    getSitemapXml,
    buildRobotsTxt,
};
