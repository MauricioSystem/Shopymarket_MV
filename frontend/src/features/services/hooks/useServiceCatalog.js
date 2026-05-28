import { useCallback, useState } from 'react';
import {
    getAllServices,
    createService,
} from '@/services/marketApi';

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

    // CAMBIO: Estados para gestionar la subida física de la imagen del servicio
    const [serviceImageFile, setServiceImageFile] = useState(null);
    const [serviceImagePreview, setServiceImagePreview] = useState(null);

    const loadProfileServices = useCallback(async (profileId) => {
        if (!profileId) return;
        setLoadingServices(true);
        try {
            const res = await getAllServices(token);
            const allServs = Array.isArray(res?.data) ? res.data : [];
            setProfileServices(allServs.filter(s => Number(s.service_profile_id) === Number(profileId)));
        } catch (err) {
            console.error("Error loading services:", err);
        } finally {
            setLoadingServices(false);
        }
    }, [token]);

    // CAMBIO: Manejador para detectar cambio de archivo y generar vista previa
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
        setSavingService(true);
        setErrorService(null);
        try {
            // CAMBIO: Convertir el envío a FormData para permitir subidas físicas vía multer
            const formData = new FormData();
            formData.append('name', serviceForm.name);
            formData.append('description', serviceForm.description || '');
            formData.append('price', Number(serviceForm.price));
            formData.append('estimated_time', serviceForm.estimated_time || '');
            formData.append('category_id', serviceForm.category_id);
            formData.append('service_profile_id', existingServiceProfile.id);
            formData.append('status', 'active');

            if (serviceImageFile) {
                formData.append('image', serviceImageFile);
            } else if (serviceForm.image_url) {
                formData.append('image_url', serviceForm.image_url);
            }

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

    return {
        profileServices,
        loadingServices,
        savingService,
        errorService,
        serviceForm,
        setServiceForm,
        addingService,
        setAddingService,
        serviceImageFile,
        serviceImagePreview,
        setServiceImageFile,
        setServiceImagePreview,
        handleServiceImageChange,
        loadProfileServices,
        handleCreateService,
    };
}
