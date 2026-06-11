import { useCallback, useState } from 'react';
import {
    getAllServices,
    createService,
    updateService,
    deleteService,
} from '@/services/marketApi';
import { API_BASE_URL } from "@/config/appSettings";

const API_BASE = API_BASE_URL;

const defaultServiceForm = {
    name: '',
    description: '',
    price: '',
    estimated_time: '',
    image_url: '',
    category_id: ''
};

export function useServiceCatalog({ token, existingServiceProfile }) {
    const [profileServices, setProfileServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [savingService, setSavingService] = useState(false);
    const [errorService, setErrorService] = useState(null);

    const [serviceForm, setServiceForm] = useState(defaultServiceForm);
    const [addingService, setAddingService] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const [serviceImageFile, setServiceImageFile] = useState(null);
    const [serviceImagePreview, setServiceImagePreview] = useState(null);

    const loadProfileServices = useCallback(async (profileId) => {
        if (!profileId) return;
        setLoadingServices(true);
        try {
            const res = await getAllServices(token);
            const allServs = Array.isArray(res?.data) ? res.data : [];
            setProfileServices(allServs.filter(s => Number(s.service_profile_id) === Number(profileId) && s.status !== 'inactive'));
        } catch (err) {
            console.error("Error loading services:", err);
        } finally {
            setLoadingServices(false);
        }
    }, [token]);

    const handleServiceImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setServiceImageFile(file);
            setServiceImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        if (!existingServiceProfile?.id) return;
        if (!serviceImageFile) {
            setErrorService('La imagen del servicio es obligatoria.');
            return;
        }
        setSavingService(true);
        setErrorService(null);
        try {
            const formData = new FormData();
            formData.append('name', serviceForm.name);
            formData.append('description', serviceForm.description || '');
            formData.append('price', Number(serviceForm.price));
            formData.append('estimated_time', serviceForm.estimated_time || '');
            formData.append('category_id', serviceForm.category_id);
            formData.append('service_profile_id', existingServiceProfile.id);
            formData.append('status', 'active');
            formData.append('image', serviceImageFile);

            await createService(token, formData);
            setServiceForm(defaultServiceForm);
            setServiceImageFile(null);
            setServiceImagePreview(null);
            setAddingService(false);
            await loadProfileServices(existingServiceProfile.id);
        } catch (err) {
            setErrorService(err?.message || 'Error al guardar el servicio.');
        } finally {
            setSavingService(false);
        }
    };

    const handleEditServiceClick = (s) => {
        setEditingService(s);
        setServiceForm({
            name: s.name || '',
            description: s.description || '',
            price: String(s.price || ''),
            estimated_time: s.estimated_time || '',
            image_url: s.image_url || '',
            category_id: String(s.category_id || '')
        });
        setServiceImageFile(null);
        setServiceImagePreview(s.image_url ? (s.image_url.startsWith('http') ? s.image_url : `${API_BASE}${s.image_url}`) : null);
        setErrorService(null);
        setAddingService(false);
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        if (!existingServiceProfile?.id || !editingService?.id) return;
        setSavingService(true);
        setErrorService(null);
        try {
            const formData = new FormData();
            formData.append('name', serviceForm.name);
            formData.append('description', serviceForm.description || '');
            formData.append('price', Number(serviceForm.price));
            formData.append('estimated_time', serviceForm.estimated_time || '');
            if (serviceForm.category_id) {
                formData.append('category_id', serviceForm.category_id);
            }
            formData.append('service_profile_id', existingServiceProfile.id);
            formData.append('status', 'active');

            if (serviceImageFile) {
                formData.append('image', serviceImageFile);
            } else if (serviceForm.image_url) {
                formData.append('image_url', serviceForm.image_url);
            }

            await updateService(token, editingService.id, formData);
            setServiceForm(defaultServiceForm);
            setServiceImageFile(null);
            setServiceImagePreview(null);
            setEditingService(null);
            await loadProfileServices(existingServiceProfile.id);
        } catch (err) {
            setErrorService(err?.message || 'Error al actualizar el servicio.');
        } finally {
            setSavingService(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio permanentemente de tu portafolio?')) return;
        try {
            await deleteService(token, serviceId);
            if (existingServiceProfile?.id) {
                await loadProfileServices(existingServiceProfile.id);
            }
        } catch (err) {
            alert(err?.message || 'Error al eliminar el servicio.');
        }
    };

    return {
        profileServices,
        loadingServices,
        savingService,
        errorService,
        serviceForm,
        setServiceForm,
        addingService,
        setAddingService,
        editingService,
        setEditingService,
        serviceImageFile,
        serviceImagePreview,
        setServiceImagePreview,
        setServiceImageFile,
        setErrorService,
        handleServiceImageChange,
        loadProfileServices,
        handleCreateService,
        handleEditServiceClick,
        handleUpdateService,
        handleDeleteService,
    };
}

