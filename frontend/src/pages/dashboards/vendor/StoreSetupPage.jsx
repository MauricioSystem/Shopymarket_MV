/**
 * Guides vendors through setting up and running their commerce:
 *   - Tab 1: Live Store Details Preview
 *   - Tab 2: Edit Store/Service Info (including logo/banner uploads)
 *   - Tab 3: Manage Products (catalog creation and viewing)
 *   - Tab 4: Manage Services (catalog creation and viewing)
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import BrandMark from '@/components/ui/BrandMark';
import { getDisplayName, getProfileImageUrl } from '@/utils/userCapabilities';
import {
    getAllCategories,
    getAllSubcategories,
    createSubcategory,
} from '@/services/marketApi';

// Hook & Feature Imports
import { useStoreSetup } from '@/features/stores/hooks/useStoreSetup';
import { StoreFormSection } from '@/features/stores/components/StoreFormSection';
import { ProductCatalogSection } from '@/features/products/components/ProductCatalogSection';
import { ServiceCatalogSection } from '@/features/services/components/ServiceCatalogSection';
import { VendorCategoriesSection } from '@/features/categories/components/VendorCategoriesSection';

function Navbar({ user, onProfile, onLogout }) {
    return (
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,12,22,0.8)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <BrandMark compact tone="light" />
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onProfile}
                        className="hidden sm:flex flex-col items-end cursor-pointer group select-none"
                    >
                        <p className="text-xs font-semibold text-white/80 group-hover:text-[#f5d367] transition-colors">
                            {getDisplayName(user)}
                        </p>
                        <p className="text-[0.6rem] text-white/40">Vendedor</p>
                    </button>
                    <div
                        onClick={onProfile}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-[#f5d367] overflow-hidden cursor-pointer hover:border-[#f5d367]/40 transition-colors shrink-0"
                    >
                        {user?.profile_image_url ? (
                            <img
                                src={getProfileImageUrl(user.profile_image_url)}
                                alt="Perfil"
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            user?.first_name?.[0]?.toUpperCase() || '?'
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="text-xs font-bold text-white/40 hover:text-red-400 transition-colors"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </header>
    );
}

export default function StoreSetupPage({ overrideUser = null, onBack = null }) {
    const { token, user, logout, setCurrentView, setSelectedStoreId, setSelectedServiceProfileId } = useAuth();
    const targetUser = overrideUser || user;

    // Navigation Tabs State
    const [activeDashboardTab, setActiveDashboardTab] = useState('edit');

    // Shared Category States
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const refreshCategories = useCallback(async () => {
        try {
            const [cats, subcats] = await Promise.all([
                getAllCategories(token),
                getAllSubcategories(token)
            ]);
            setCategories(Array.isArray(cats?.data) ? cats.data : []);
            setSubcategories(Array.isArray(subcats?.data) ? subcats.data : []);
        } catch (err) {
            console.error("Error refreshing categories:", err);
        }
    }, [token]);

    useEffect(() => {
        refreshCategories();
    }, [refreshCategories]);

    // Store Setup custom hook integration
    const {
        commerceType,
        setCommerceType,
        storeForm,
        setStoreForm,
        serviceProfileForm,
        setServiceProfileForm,
        logoFile,
        bannerFile,
        logoPreview,
        bannerPreview,
        serviceLogoFile,
        serviceBannerFile,
        serviceLogoPreview,
        serviceBannerPreview,
        existingStore,
        existingServiceProfile,
        loadingData,
        saving,
        feedbackMessage,
        setFeedbackMessage,
        loadVendorData,
        handleStoreField,
        handleServiceField,
        handleLogoChange,
        handleBannerChange,
        handleServiceLogoChange,
        handleServiceBannerChange,
        handleSave,
    } = useStoreSetup({
        token,
        targetUser,
        setSelectedStoreId,
        setSelectedServiceProfileId,
    });

    const handleCreateSubcategory = async (name, categoryId) => {
        if (!name || !categoryId) return;
        try {
            const payload = {
                name,
                category_id: Number(categoryId),
                status: 'active'
            };
            if (existingStore?.id) {
                payload.store_id = existingStore.id;
            }
            const result = await createSubcategory(token, payload);
            await refreshCategories();
            return result?.data || result;
        } catch (err) {
            throw new Error(err?.message || 'Error al crear la subcategoría');
        }
    };

    const goToProfile = () => setCurrentView('profile');

    const wantsStore = commerceType === 'products' || commerceType === 'both';
    const wantsService = commerceType === 'services' || commerceType === 'both';
    const hasCommerce = !!existingStore || !!existingServiceProfile;

    // Define navigation tabs configuration dynamically
    const dashboardTabs = [
        { id: 'view', label: '👁️ Ver mi Comercio' },
        { id: 'edit', label: '⚙️ Editar Información' },
        ...(wantsStore ? [{ id: 'products', label: '📦 Mis Productos' }] : []),
        ...(wantsService ? [{ id: 'services', label: '🔧 Mis Servicios' }] : []),
        { id: 'categories', label: '🗂️ Estructura / Categorías' }
    ];

    return (
        <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.10),transparent_30%),linear-gradient(160deg,#040912,#07111f)]">
            {overrideUser ? (
                <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,12,22,0.8)] backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-[#f5d367] transition-colors cursor-pointer select-none"
                        >
                            ← Volver al Panel de Admin
                        </button>
                        <span className="text-xs font-bold text-[#f5d367] uppercase tracking-wider bg-[#f5d367]/10 px-3 py-1 rounded-lg">
                            Modo Administrador: Gestionando Tienda de {getDisplayName(targetUser)}
                        </span>
                        <BrandMark compact tone="light" />
                    </div>
                </header>
            ) : (
                <Navbar user={user} onProfile={goToProfile} onLogout={logout} />
            )}

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        {hasCommerce
                            ? `Bienvenido, ${getDisplayName(targetUser)}`
                            : `¡Hola, ${getDisplayName(targetUser)}! Configuremos tu comercio`}
                    </h1>
                    <p className="text-sm text-white/50 max-w-2xl leading-relaxed">
                        {hasCommerce
                            ? 'Gestiona tu catálogo, visualiza tu tienda y edita la información pública de tu negocio.'
                            : 'Elige el tipo de comercio que quieres abrir en ShopyMarket. Puedes combinar tienda de productos con servicios profesionales.'}
                    </p>
                </div>

                {loadingData ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50 text-sm animate-pulse">
                        Cargando tu información...
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Tab switcher */}
                        {hasCommerce && (
                            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                                {dashboardTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            if (tab.id === 'view') {
                                                if (existingStore?.id) {
                                                    setSelectedStoreId(existingStore.id);
                                                }
                                                if (existingServiceProfile?.id) {
                                                    setSelectedServiceProfileId(existingServiceProfile.id);
                                                }
                                                setCurrentView("store-detail");
                                                return;
                                            }
                                            setActiveDashboardTab(tab.id);
                                            setFeedbackMessage(null);
                                        }}
                                        className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                                            activeDashboardTab === tab.id
                                                ? 'bg-[#f5d367] text-[#120c00] shadow-md shadow-[#f5d367]/20'
                                                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TAB: EDIT STORE DETAILS */}
                        {(!hasCommerce || activeDashboardTab === 'edit') && (
                            <StoreFormSection
                                commerceType={commerceType}
                                setCommerceType={setCommerceType}
                                existingStore={existingStore}
                                existingServiceProfile={existingServiceProfile}
                                wantsStore={wantsStore}
                                wantsService={wantsService}
                                hasCommerce={hasCommerce}
                                storeForm={storeForm}
                                handleStoreField={handleStoreField}
                                logoPreview={logoPreview}
                                bannerPreview={bannerPreview}
                                handleLogoChange={handleLogoChange}
                                handleBannerChange={handleBannerChange}
                                serviceProfileForm={serviceProfileForm}
                                handleServiceField={handleServiceField}
                                serviceLogoPreview={serviceLogoPreview}
                                serviceBannerPreview={serviceBannerPreview}
                                handleServiceLogoChange={handleServiceLogoChange}
                                handleServiceBannerChange={handleServiceBannerChange}
                                saving={saving}
                                feedbackMessage={feedbackMessage}
                                handleSave={async (e) => {
                                    const result = await handleSave(e);
                                    if (result?.success && hasCommerce) {
                                        setActiveDashboardTab('view');
                                    }
                                }}
                            />
                        )}

                        {/* TAB: MANAGE PRODUCTS */}
                        {hasCommerce && activeDashboardTab === 'products' && (
                            <ProductCatalogSection
                                token={token}
                                existingStore={existingStore}
                                categories={categories}
                                subcategories={subcategories}
                                refreshCategories={refreshCategories}
                            />
                        )}

                        {/* TAB: MANAGE SERVICES */}
                        {hasCommerce && activeDashboardTab === 'services' && (
                            <ServiceCatalogSection
                                token={token}
                                existingServiceProfile={existingServiceProfile}
                                categories={categories}
                            />
                        )}

                        {/* TAB: PLATFORM CATEGORIES & SUBCATEGORIES */}
                        {hasCommerce && activeDashboardTab === 'categories' && (
                            <VendorCategoriesSection
                                categories={categories}
                                subcategories={subcategories}
                                handleCreateSubcategory={handleCreateSubcategory}
                            />
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
