import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_BASE_URL } from "@/config/appSettings";
import { getSeoMeta } from "../../services/seoApi";

const FALLBACK_SEO = {
    title: "Shopy Market | Tiendas, productos y servicios locales",
    description: "ShopyMarket conecta clientes con tiendas, productos y servicios locales en un solo mercado digital.",
    canonical: "http://localhost:5173/home",
    robots: "index,follow",
    keywords: [
        "ShopyMarket",
        "marketplace local",
        "tiendas online",
        "productos locales",
        "servicios locales",
    ],
    openGraph: {
        title: "Shopy Market | Tiendas, productos y servicios locales",
        description: "ShopyMarket conecta clientes con tiendas, productos y servicios locales en un solo mercado digital.",
        url: "http://localhost:5173/home",
        siteName: "ShopyMarket",
        type: "website",
        image: null,
    },
};

const BLOCKED_PATHS = ["/dashboard", "/cart", "/my-orders", "/profile"];

function upsertMeta(attribute, key, content) {
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

    if (!content) {
        element?.remove();
        return;
    }

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.setAttribute("content", content);
}

function upsertCanonical(href) {
    let element = document.head.querySelector('link[rel="canonical"]');

    if (!href) {
        element?.remove();
        return;
    }

    if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
        document.head.appendChild(element);
    }

    element.setAttribute("href", href);
}

function applySeo(meta) {
    const seo = meta || FALLBACK_SEO;
    const openGraph = seo.openGraph || {};
    const description = seo.description || FALLBACK_SEO.description;
    const title = seo.title || FALLBACK_SEO.title;
    const keywords = Array.isArray(seo.keywords) ? seo.keywords.join(", ") : seo.keywords;

    document.title = title;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", seo.robots || FALLBACK_SEO.robots);
    upsertMeta("property", "og:title", openGraph.title || title);
    upsertMeta("property", "og:description", openGraph.description || description);
    upsertMeta("property", "og:url", openGraph.url || seo.canonical);
    upsertMeta("property", "og:site_name", openGraph.siteName || FALLBACK_SEO.openGraph.siteName);
    upsertMeta("property", "og:type", openGraph.type || "website");
    upsertMeta("property", "og:image", openGraph.image);
    upsertCanonical(seo.canonical);
}

function buildFallbackSeo(pathname) {
    const path = pathname || "/home";
    const canonical = `${SITE_BASE_URL}${path}`;
    const isBlockedPath = BLOCKED_PATHS.some((blockedPath) => path.startsWith(blockedPath));

    return {
        ...FALLBACK_SEO,
        canonical,
        robots: isBlockedPath ? "noindex,nofollow" : FALLBACK_SEO.robots,
        openGraph: {
            ...FALLBACK_SEO.openGraph,
            url: canonical,
        },
    };
}

export default function SeoHead() {
    const location = useLocation();

    useEffect(() => {
        const controller = new AbortController();
        const currentPath = location.pathname || "/home";

        getSeoMeta(currentPath, { signal: controller.signal })
            .then((meta) => {
                if (!controller.signal.aborted) {
                    applySeo(meta || buildFallbackSeo(currentPath));
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    applySeo(buildFallbackSeo(currentPath));
                }
            });

        return () => controller.abort();
    }, [location.pathname]);

    return null;
}
