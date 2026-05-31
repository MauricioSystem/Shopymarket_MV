import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { useVendorPanel } from '@/features/vendor-panel/hooks/useVendorPanel';
import { VendorPanelHeader } from '@/features/vendor-panel/components/VendorPanelHeader';
import { VendorPanelSidebar } from '@/features/vendor-panel/components/VendorPanelSidebar';
import { StoreForm } from '@/features/vendor-panel/components/StoreForm';
import { ServiceProfileForm } from '@/features/vendor-panel/components/ServiceProfileForm';
import { ServiceForm } from '@/features/vendor-panel/components/ServiceForm';
import { ProductForm } from '@/features/vendor-panel/components/ProductForm';
import { SubcategoryForm } from '@/features/vendor-panel/components/SubcategoryForm';

const VENDOR_MODES = [
  { value: 'store', label: 'Tienda' },
  { value: 'serviceProfile', label: 'Perfil de servicio' },
  { value: 'service', label: 'Servicio' },
  { value: 'product', label: 'Producto' },
  { value: 'subcategory', label: 'Subcategoría' },
];

function VendorPanelPage() {
  const { token } = useAuth();
  
  const {
    mode,
    setMode,
    loading,
    actionLoading,
    error,
    setError,
    success,
    setSuccess,
    stores,
    serviceProfiles,
    categories,
    subcategories,
    storeForm,
    setStoreForm,
    logoFile,
    setLogoFile,
    bannerFile,
    setBannerFile,
    profileForm,
    setProfileForm,
    serviceLogoFile,
    setServiceLogoFile,
    serviceBannerFile,
    setServiceBannerFile,
    serviceForm,
    setServiceForm,
    productForm,
    setProductForm,
    productImageFile,
    setProductImageFile,
    subcategoryForm,
    setSubcategoryForm,
    inlineCatOpen,
    setInlineCatOpen,
    inlineCatName,
    setInlineCatName,
    inlineSubOpen,
    setInlineSubOpen,
    inlineSubName,
    setInlineSubName,
    inlineServCatOpen,
    setInlineServCatOpen,
    inlineServCatName,
    setInlineServCatName,
    availableSubcategories,
    loadData,
    handleSubmit,
  } = useVendorPanel({ token });

  const activeModeLabel = VENDOR_MODES.find((item) => item.value === mode)?.label || 'recurso';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <VendorPanelHeader loadData={loadData} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <VendorPanelSidebar
            mode={mode}
            setMode={setMode}
            setSuccess={setSuccess}
            setError={setError}
            stores={stores}
            serviceProfiles={serviceProfiles}
            categories={categories}
            subcategories={subcategories}
          />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Formulario</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Crear {activeModeLabel}</h2>
              </div>
            </div>

            {loading ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Cargando datos de soporte...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error ? (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
                ) : null}
                {success ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>
                ) : null}

                {mode === 'store' && (
                  <StoreForm
                    storeForm={storeForm}
                    setStoreForm={setStoreForm}
                    setLogoFile={setLogoFile}
                    setBannerFile={setBannerFile}
                  />
                )}

                {mode === 'serviceProfile' && (
                  <ServiceProfileForm
                    profileForm={profileForm}
                    setProfileForm={setProfileForm}
                    stores={stores}
                    setServiceLogoFile={setServiceLogoFile}
                    setServiceBannerFile={setServiceBannerFile}
                  />
                )}

                {mode === 'service' && (
                  <ServiceForm
                    token={token}
                    serviceForm={serviceForm}
                    setServiceForm={setServiceForm}
                    serviceProfiles={serviceProfiles}
                    categories={categories}
                    inlineServCatOpen={inlineServCatOpen}
                    setInlineServCatOpen={setInlineServCatOpen}
                    inlineServCatName={inlineServCatName}
                    setInlineServCatName={setInlineServCatName}
                    loadData={loadData}
                  />
                )}

                {mode === 'product' && (
                  <ProductForm
                    token={token}
                    productForm={productForm}
                    setProductForm={setProductForm}
                    stores={stores}
                    categories={categories}
                    availableSubcategories={availableSubcategories}
                    inlineCatOpen={inlineCatOpen}
                    setInlineCatOpen={setInlineCatOpen}
                    inlineCatName={inlineCatName}
                    setInlineCatName={setInlineCatName}
                    inlineSubOpen={inlineSubOpen}
                    setInlineSubOpen={setInlineSubOpen}
                    inlineSubName={inlineSubName}
                    setInlineSubName={setInlineSubName}
                    setProductImageFile={setProductImageFile}
                    loadData={loadData}
                  />
                )}

                {mode === 'subcategory' && (
                  <SubcategoryForm
                    subcategoryForm={subcategoryForm}
                    setSubcategoryForm={setSubcategoryForm}
                    categories={categories}
                    stores={stores}
                  />
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">Selecciona el recurso que quieras crear y envía el formulario.</p>
                  <Button type="submit" loading={actionLoading}>
                    Crear {activeModeLabel}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default VendorPanelPage;
