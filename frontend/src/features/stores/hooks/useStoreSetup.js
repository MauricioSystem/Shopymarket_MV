import { useCallback, useEffect, useState } from 'react';
import {
    createServiceProfile,
    createStore,
    getAllServiceProfiles,
    getAllStores,
    updateMyStore,
    updateServiceProfile,
} from '@/services/marketApi';

const defaultStoreForm = {
    name: '',
    description: '',
    background_color: '#07111f',
    logo_url: '',
    banner_url: '',
    country: 'Bolivia',
    city: 'Santa Cruz',
    address: '',
};

const defaultServiceProfileForm = {
    name: '',
    description: '',
    background_color: '#07111f',
    profile_image_url: '',
    banner_url: '',
    country: 'Bolivia',
    city: 'Santa Cruz',
    address: '',
};

export function useStoreSetup({
    token,
    targetUser,
    setSelectedStoreId,
    setSelectedServiceProfileId,
    loadStoreProducts,
    loadProfileServices,
}) {
    const [commerceType, setCommerceType] = useState(null);

    // Form states
    const [storeForm, setStoreForm] = useState(defaultStoreForm);
    const [serviceProfileForm, setServiceProfileForm] = useState(defaultServiceProfileForm);

    // File upload and preview states (Store)
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // File upload and preview states (Service Profile)
    const [serviceLogoFile, setServiceLogoFile] = useState(null);
    const [serviceBannerFile, setServiceBannerFile] = useState(null);
    const [serviceLogoPreview, setServiceLogoPreview] = useState(null);
    const [serviceBannerPreview, setServiceBannerPreview] = useState(null);

    // Existing resources loaded from API
    const [existingStore, setExistingStore] = useState(null);
    const [existingServiceProfile, setExistingServiceProfile] = useState(null);

    // Loaders & Errors
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);

    // Load vendor's existing resources
    const loadVendorData = useCallback(async () => {
        if (!targetUser?.id) return;
        setLoadingData(true);
        try {
            const [storesResult, profilesResult] = await Promise.all([
                getAllStores(token),
                getAllServiceProfiles(token),
            ]);

            const allStores = Array.isArray(storesResult?.data) ? storesResult.data : [];
            const allProfiles = Array.isArray(profilesResult?.data) ? profilesResult.data : [];

            // Filter for the ones owned by target user
            const myStores = allStores.filter(s => s && String(s.admin_user_id) === String(targetUser.id));
            const myProfiles = allProfiles.filter(p => p && String(p.admin_user_id) === String(targetUser.id));

            let store = myStores[0] || null;
            let profile = myProfiles[0] || null;

            if (store) {
                if (store.status === 'inactive') {
                    try {
                        await updateMyStore(token, store.id, { ...store, status: 'active' });
                        store = { ...store, status: 'active' };
                    } catch (err) {
                        console.error("Auto-reactivating store failed:", err);
                    }
                }
                setExistingStore(store);
                setSelectedStoreId(store.id);
                setStoreForm({
                    name: store.name || '',
                    description: store.description || '',
                    background_color: store.background_color || '#07111f',
                    logo_url: store.logo_url || '',
                    banner_url: store.banner_url || '',
                    country: store.country || 'Bolivia',
                    city: store.city || 'Santa Cruz',
                    address: store.address || '',
                });
                if (loadStoreProducts) {
                    loadStoreProducts(store.id);
                }
            } else {
                setExistingStore(null);
                setSelectedStoreId(null);
            }

            if (profile) {
                if (profile.status === 'inactive') {
                    try {
                        await updateServiceProfile(token, profile.id, { ...profile, status: 'active' });
                        profile = { ...profile, status: 'active' };
                    } catch (err) {
                        console.error("Auto-reactivating service profile failed:", err);
                    }
                }
                setExistingServiceProfile(profile);
                setSelectedServiceProfileId(profile.id);
                setServiceProfileForm({
                    name: profile.name || '',
                    description: profile.description || '',
                    background_color: profile.background_color || '#07111f',
                    profile_image_url: profile.profile_image_url || '',
                    banner_url: profile.banner_url || '',
                    country: profile.country || 'Bolivia',
                    city: profile.city || 'Santa Cruz',
                    address: profile.address || '',
                });
                if (loadProfileServices) {
                    loadProfileServices(profile.id);
                }
            } else {
                setExistingServiceProfile(null);
                setSelectedServiceProfileId(null);
            }

            if (store && profile) {
                setCommerceType('both');
            } else if (store) {
                setCommerceType('products');
            } else if (profile) {
                setCommerceType('services');
            } else {
                setCommerceType(null);
            }
        } catch (err) {
            console.error("Error loading vendor data:", err);
        } finally {
            setLoadingData(false);
        }
    }, [token, targetUser?.id, setSelectedStoreId, setSelectedServiceProfileId, loadStoreProducts, loadProfileServices]);

    useEffect(() => {
        loadVendorData();
    }, [loadVendorData]);

    const handleStoreField = (field) => (e) =>
        setStoreForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleServiceField = (field) => (e) =>
        setServiceProfileForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleServiceLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setServiceLogoFile(file);
            setServiceLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleServiceBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setServiceBannerFile(file);
            setServiceBannerPreview(URL.createObjectURL(file));
        }
    };

    // Save/Update Store & Profile
    const handleSave = async (e, forceServiceView = null) => {
        e.preventDefault();
        if (!commerceType) {
            setFeedbackMessage({ type: 'error', text: 'Selecciona el tipo de comercio primero.' });
            return;
        }

        setSaving(true);
        setFeedbackMessage(null);

        try {
            let needsStore = false;
            let needsService = false;

            if (commerceType === 'both') {
                if (forceServiceView === true) {
                    needsService = true;
                } else if (forceServiceView === false) {
                    needsStore = true;
                } else {
                    needsStore = true;
                    needsService = true;
                }
            } else {
                needsStore = commerceType === 'products';
                needsService = commerceType === 'services';
            }

            let savedStoreId = existingStore?.id || null;

            if (needsStore) {
                const formData = new FormData();
                formData.append('name', storeForm.name);
                formData.append('description', storeForm.description || '');
                formData.append('background_color', storeForm.background_color);
                formData.append('country', storeForm.country || 'Bolivia');
                formData.append('city', storeForm.city || 'Santa Cruz');
                formData.append('address', storeForm.address || '');

                if (logoFile) {
                    formData.append('logo', logoFile);
                } else if (storeForm.logo_url) {
                    formData.append('logo_url', storeForm.logo_url);
                }

                if (bannerFile) {
                    formData.append('banner', bannerFile);
                } else if (storeForm.banner_url) {
                    formData.append('banner_url', storeForm.banner_url);
                }

                if (existingStore) {
                    await updateMyStore(token, existingStore.id, formData);
                } else {
                    formData.append('status', 'active');
                    const result = await createStore(token, formData);
                    const savedStore = result?.data || result;
                    setExistingStore(savedStore);
                    savedStoreId = savedStore.id;
                }
            }

            if (needsService) {
                const spFormData = new FormData();
                spFormData.append('name', serviceProfileForm.name);
                spFormData.append('description', serviceProfileForm.description || '');
                spFormData.append('background_color', serviceProfileForm.background_color);
                spFormData.append('country', serviceProfileForm.country || 'Bolivia');
                spFormData.append('city', serviceProfileForm.city || 'Santa Cruz');
                spFormData.append('address', serviceProfileForm.address || '');
                spFormData.append('store_id', savedStoreId || '');

                if (serviceLogoFile) {
                    spFormData.append('logo', serviceLogoFile);
                } else if (serviceProfileForm.profile_image_url) {
                    spFormData.append('profile_image_url', serviceProfileForm.profile_image_url);
                }

                if (serviceBannerFile) {
                    spFormData.append('banner', serviceBannerFile);
                } else if (serviceProfileForm.banner_url) {
                    spFormData.append('banner_url', serviceProfileForm.banner_url);
                }

                if (existingServiceProfile) {
                    await updateServiceProfile(token, existingServiceProfile.id, spFormData);
                } else {
                    spFormData.append('status', 'active');
                    const result = await createServiceProfile(token, spFormData);
                    const savedProfile = result?.data || result;
                    setExistingServiceProfile(savedProfile);
                    if (savedProfile?.id) {
                        setSelectedServiceProfileId(savedProfile.id);
                    }
                }
            }

            setFeedbackMessage({ type: 'success', text: '¡Tu comercio fue guardado exitosamente!' });
            setLogoFile(null);
            setBannerFile(null);
            setLogoPreview(null);
            setBannerPreview(null);
            setServiceLogoFile(null);
            setServiceBannerFile(null);
            setServiceLogoPreview(null);
            setServiceBannerPreview(null);
            if (savedStoreId) {
                setSelectedStoreId(savedStoreId);
            }
            await loadVendorData();
            return { success: true };
        } catch (err) {
            setFeedbackMessage({
                type: 'error',
                text: err?.message || 'Ocurrió un error al guardar. Intenta nuevamente.',
            });
            return { success: false };
        } finally {
            setSaving(false);
        }
    };

    return {
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
    };
}
