import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getProfileImageUrl } from '@/utils/userCapabilities';
import Icon from '@/components/ui/Icon';
import LeafletMap from '@/components/ui/LeafletMap';

const COMMERCE_TYPES = [
    {
        value: 'products',
        icon: 'market',
        title: 'Tienda de Productos',
        description: 'Vende artículos físicos o digitales: ropa, tecnología, alimentos y más.',
        color: '#f5d367',
    },
    {
        value: 'services',
        icon: 'wrench',
        title: 'Perfil de Servicios',
        description: 'Ofrece servicios profesionales: reparaciones, consultoría, instalaciones, etc.',
        color: '#60a5fa',
    },
    {
        value: 'both',
        icon: 'store',
        title: 'Tienda + Servicios',
        description: 'Lo mejor de ambos mundos: vende productos Y ofrece servicios profesionales.',
        color: '#a78bfa',
    },
];

function SectionLabel({ children }) {
    return (
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-[#f5d367] mb-4">
            {children}
        </p>
    );
}

function FieldGroup({ children }) {
    return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function StorePreviewCard({ storeForm, logoPreview, bannerPreview }) {
    const logoSrc = logoPreview || getProfileImageUrl(storeForm.logo_url);
    const bannerSrc = bannerPreview || getProfileImageUrl(storeForm.banner_url);
    const hasLogo = !!logoSrc;
    const hasBanner = !!bannerSrc;

    return (
        <div
            className="rounded-2xl overflow-hidden border border-white/10 shadow-xl transition-all duration-500"
            style={{ background: storeForm.background_color || '#07111f' }}
        >
            {hasBanner ? (
                <div
                    className="h-28 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bannerSrc})` }}
                />
            ) : (
                <div className="h-28 flex items-center justify-center bg-white/5">
                    <span className="text-xs text-white/30">Banner de tu tienda</span>
                </div>
            )}
            <div className="p-5 flex items-center gap-4">
                {hasLogo ? (
                    <img
                        src={logoSrc}
                        alt="Logo"
                        className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Icon name="store" className="h-6 w-6 text-white/40" />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="font-bold text-white truncate">
                        {storeForm.name || 'Nombre de tu tienda'}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5 truncate">
                        {storeForm.city && storeForm.country
                            ? `${storeForm.city}, ${storeForm.country}`
                            : 'Ciudad, País'}
                    </p>
                    <p className="text-xs text-white/40 mt-1 line-clamp-1">
                        {storeForm.description || 'Descripción de tu tienda...'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ServicePreviewCard({ profileForm, logoPreview, bannerPreview }) {
    const logoSrc = logoPreview || getProfileImageUrl(profileForm.profile_image_url);
    const bannerSrc = bannerPreview || getProfileImageUrl(profileForm.banner_url);
    const hasLogo = !!logoSrc;
    const hasBanner = !!bannerSrc;

    return (
        <div
            className="rounded-2xl overflow-hidden border border-white/10 shadow-xl transition-all duration-500"
            style={{ background: profileForm.background_color || '#07111f' }}
        >
            {hasBanner ? (
                <div
                    className="h-28 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bannerSrc})` }}
                />
            ) : (
                <div className="h-28 flex items-center justify-center bg-white/5">
                    <span className="text-xs text-white/30">Banner de servicios</span>
                </div>
            )}
            <div className="p-5 flex items-center gap-4">
                {hasLogo ? (
                    <img
                        src={logoSrc}
                        alt="Logo/Marca"
                        className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Icon name="wrench" className="h-6 w-6 text-white/40" />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="font-bold text-white truncate">
                        {profileForm.name || 'Nombre del perfil'}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5 truncate">
                        {profileForm.city && profileForm.country
                            ? `${profileForm.city}, ${profileForm.country}`
                            : 'Ciudad, País'}
                    </p>
                    <p className="text-xs text-white/40 mt-1 line-clamp-1">
                        {profileForm.description || 'Descripción del perfil...'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function CommerceTypeSelector({ selected, onSelect }) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {COMMERCE_TYPES.map((type) => {
                const isActive = selected === type.value;
                return (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => onSelect(type.value)}
                        className={`group relative text-left rounded-2xl p-5 border-2 transition-all duration-300 ${
                            isActive
                                ? 'border-[#f5d367] bg-[#f5d367]/10 shadow-[0_0_30px_rgba(245,211,103,0.1)]'
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                        }`}
                        aria-pressed={isActive}
                    >
                        <div className="mb-3">
                            <Icon name={type.icon} className="h-8 w-8 text-[#f5d367]" />
                        </div>
                        <p className={`font-bold text-sm ${isActive ? 'text-[#f5d367]' : 'text-white'}`}>
                            {type.title}
                        </p>
                        <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                            {type.description}
                        </p>
                        {isActive && (
                            <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#f5d367] flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#120c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export function StoreFormSection({
    commerceType,
    setCommerceType,
    existingStore,
    existingServiceProfile,
    wantsStore,
    wantsService,
    hasCommerce,
    storeForm,
    handleStoreField,
    logoPreview,
    bannerPreview,
    handleLogoChange,
    handleBannerChange,
    serviceProfileForm,
    handleServiceField,
    serviceLogoPreview,
    serviceBannerPreview,
    handleServiceLogoChange,
    handleServiceBannerChange,
    saving,
    feedbackMessage,
    handleSave,
}) {
    return (
        <form onSubmit={handleSave} className="space-y-10">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 space-y-6">
                <SectionLabel>Comencemos eligiendo el tipo de comercio</SectionLabel>
                {hasCommerce ? (
                    <div className="p-4 rounded-xl border border-[#f5d367]/20 bg-[#f5d367]/5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/40">Tipo de comercio seleccionado</p>
                            <div className="text-sm font-bold text-white mt-1">
                                {commerceType === 'products' && (
                                    <span className="flex items-center gap-1.5">
                                        <Icon name="market" className="h-4 w-4 text-[#f5d367]" />
                                        <span>Tienda de Productos</span>
                                    </span>
                                )}
                                {commerceType === 'services' && (
                                    <span className="flex items-center gap-1.5">
                                        <Icon name="wrench" className="h-4 w-4 text-blue-400" />
                                        <span>Perfil de Servicios</span>
                                    </span>
                                )}
                                {commerceType === 'both' && (
                                    <span className="flex items-center gap-1.5">
                                        <Icon name="store" className="h-4 w-4 text-[#f5d367]" />
                                        <span>Tienda + Servicios (Híbrido)</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-[#f5d367] uppercase tracking-wider bg-white/5 px-3 py-1 rounded-lg">
                            No modificable
                        </span>
                    </div>
                ) : (
                    <CommerceTypeSelector selected={commerceType} onSelect={setCommerceType} />
                )}
            </section>

            {wantsStore && (
                <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <SectionLabel>
                                {existingStore
                                    ? 'Tu Tienda — Personalización'
                                    : 'Paso 2 — Crea tu Tienda'}
                            </SectionLabel>
                            <p className="text-xs text-white/40 -mt-2">
                                {existingStore
                                    ? 'Actualiza los datos y apariencia de tu tienda.'
                                    : 'Configura la apariencia y datos de tu nueva tienda.'}
                            </p>
                        </div>
                        {existingStore && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                                Publica
                            </span>
                        )}
                    </div>

                    <div className="grid gap-8 xl:grid-cols-2">
                        <div className="space-y-5">
                            <FieldGroup>
                                <Input
                                    label="Nombre de la tienda *"
                                    name="store_name"
                                    value={storeForm.name}
                                    onChange={handleStoreField('name')}
                                    required
                                />
                                <Select
                                    label="Ciudad"
                                    name="store_city"
                                    value={storeForm.city}
                                    onChange={handleStoreField('city')}
                                    options={[
                                        "Santa Cruz",
                                        "Tarija",
                                        "Beni",
                                        "Chuquisaca",
                                        "Cochabamba",
                                        "La Paz",
                                        "Oruro",
                                        "Pando",
                                        "Potosí",
                                    ]}
                                />
                                <Select
                                    label="País"
                                    name="store_country"
                                    value={storeForm.country}
                                    onChange={handleStoreField('country')}
                                    options={["Bolivia"]}
                                />
                                <div className="col-span-1 sm:col-span-2">
                                    <LeafletMap
                                        value={storeForm.address}
                                        onChange={(val) => handleStoreField('address')({ target: { value: val } })}
                                        label="Ubicación y Dirección de la Tienda"
                                    />
                                </div>
                                <Input
                                    label="Logo de la tienda"
                                    name="store_logo"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    onChange={handleLogoChange}
                                    helperText={existingStore?.logo_url ? "Ya tienes un logo subido. Selecciona otro si deseas cambiarlo." : "Formatos permitidos: PNG, JPG o JPEG. Máx: 5MB"}
                                />
                                <Input
                                    label="Banner de la tienda"
                                    name="store_banner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    onChange={handleBannerChange}
                                    helperText={existingStore?.banner_url ? "Ya tienes un banner subido. Selecciona otro si deseas cambiarlo." : "Formatos permitidos: PNG, JPG o JPEG. Máx: 5MB"}
                                />
                            </FieldGroup>

                            <Input
                                    label="Descripción"
                                    name="store_description"
                                    value={storeForm.description}
                                    onChange={handleStoreField('description')}
                            />

                            <label className="block space-y-2">
                                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                                    Color de fondo
                                </span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={storeForm.background_color}
                                        onChange={handleStoreField('background_color')}
                                        className="h-10 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent p-0.5"
                                    />
                                    <span className="text-xs text-white/40 font-mono">
                                        {storeForm.background_color}
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                                Vista previa
                            </p>
                            <StorePreviewCard
                                storeForm={storeForm}
                                logoPreview={logoPreview}
                                bannerPreview={bannerPreview}
                            />
                        </div>
                    </div>
                </section>
            )}

            {wantsService && (
                <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <SectionLabel>
                                {existingServiceProfile
                                    ? 'Tu Perfil de Servicios — Personalización'
                                    : wantsStore
                                    ? 'Paso 3 — Crea tu Perfil de Servicios'
                                    : 'Paso 2 — Crea tu Perfil de Servicios'}
                            </SectionLabel>
                            <p className="text-xs text-white/40 -mt-2">
                                {existingServiceProfile
                                    ? 'Actualiza los datos y apariencia de tu perfil de servicios.'
                                    : 'Configura el perfil donde los clientes contratarán tus servicios profesionales.'}
                            </p>
                        </div>
                        {existingServiceProfile && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                                Publico
                            </span>
                        )}
                    </div>

                    <div className="grid gap-8 xl:grid-cols-2">
                        <div className="space-y-5">
                            <FieldGroup>
                                <Input
                                    label="Nombre del perfil *"
                                    name="sp_name"
                                    value={serviceProfileForm.name}
                                    onChange={handleServiceField('name')}
                                    required
                                />
                                <Select
                                    label="Ciudad"
                                    name="sp_city"
                                    value={serviceProfileForm.city}
                                    onChange={handleServiceField('city')}
                                    options={[
                                        "Santa Cruz",
                                        "Tarija",
                                        "Beni",
                                        "Chuquisaca",
                                        "Cochabamba",
                                        "La Paz",
                                        "Oruro",
                                        "Pando",
                                        "Potosí",
                                    ]}
                                />
                                <Select
                                    label="País"
                                    name="sp_country"
                                    value={serviceProfileForm.country}
                                    onChange={handleServiceField('country')}
                                    options={["Bolivia"]}
                                />
                                <div className="col-span-1 sm:col-span-2">
                                    <LeafletMap
                                        value={serviceProfileForm.address}
                                        onChange={(val) => handleServiceField('address')({ target: { value: val } })}
                                        label="Ubicación y Dirección de Servicios"
                                    />
                                </div>
                                <Input
                                    label="Logo o Marca Personal"
                                    name="sp_logo"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    onChange={handleServiceLogoChange}
                                    helperText={existingServiceProfile?.profile_image_url ? "Ya tienes un logo subido. Selecciona otro si deseas cambiarlo." : "Formatos permitidos: PNG, JPG o JPEG. Máx: 5MB"}
                                />
                                <Input
                                    label="Banner del Perfil"
                                    name="sp_banner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    onChange={handleServiceBannerChange}
                                    helperText={existingServiceProfile?.banner_url ? "Ya tienes un banner subido. Selecciona otro si deseas cambiarlo." : "Formatos permitidos: PNG, JPG o JPEG. Máx: 5MB"}
                                />
                            </FieldGroup>

                            <Input
                                    label="Descripción del Perfil"
                                    name="sp_description"
                                    value={serviceProfileForm.description}
                                    onChange={handleServiceField('description')}
                            />

                            <label className="block space-y-2">
                                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                                    Color de fondo del perfil
                                </span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={serviceProfileForm.background_color}
                                        onChange={handleServiceField('background_color')}
                                        className="h-10 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent p-0.5"
                                    />
                                    <span className="text-xs text-white/40 font-mono">
                                        {serviceProfileForm.background_color}
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                                Vista previa del perfil
                            </p>
                            <ServicePreviewCard
                                profileForm={serviceProfileForm}
                                logoPreview={serviceLogoPreview}
                                bannerPreview={serviceBannerPreview}
                            />
                        </div>
                    </div>
                </section>
            )}

            {feedbackMessage && (
                <div
                    className={`rounded-2xl p-4 text-sm font-medium ${
                        feedbackMessage.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                >
                    {feedbackMessage.text}
                </div>
            )}

            {commerceType && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-white/30">
                        {hasCommerce
                            ? 'Los cambios se guardan en tu comercio existente.'
                            : 'Se creará tu comercio en ShopyMarket.'}
                    </p>
                    <Button
                        type="submit"
                        loading={saving}
                        className="bg-[#f5d367] text-[#120c00] hover:opacity-90 font-bold px-8 shadow-[0_4px_20px_rgba(245,211,103,0.25)]"
                    >
                        {hasCommerce ? 'Guardar cambios' : 'Crear mi comercio'}
                    </Button>
                </div>
            )}
        </form>
    );
}
