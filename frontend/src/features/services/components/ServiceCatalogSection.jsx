import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Icon from '@/components/ui/Icon';
import { API_BASE_URL } from "@/config/appSettings";
import { useServiceCatalog } from '../hooks/useServiceCatalog';

const API_BASE = API_BASE_URL;

function FieldGroup({ children }) {
    return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function ServiceCatalogSection({
    token,
    existingServiceProfile,
    categories,
    initialEditServiceId,
    clearInitialEditServiceId,
    searchQuery = "",
}) {
    const {
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
    } = useServiceCatalog({ token, existingServiceProfile });

    useEffect(() => {
        if (existingServiceProfile?.id) {
            loadProfileServices(existingServiceProfile.id);
        }
    }, [existingServiceProfile?.id, loadProfileServices]);

    useEffect(() => {
        if (initialEditServiceId && profileServices.length > 0 && !editingService) {
            const service = profileServices.find(s => Number(s.id) === Number(initialEditServiceId));
            if (service) {
                handleEditServiceClick(service);
                if (clearInitialEditServiceId) {
                    clearInitialEditServiceId();
                }
            }
        }
    }, [initialEditServiceId, profileServices, editingService, handleEditServiceClick, clearInitialEditServiceId]);

    const resetFormState = () => {
        setAddingService(false);
        setEditingService(null);
        setServiceForm({
            name: '',
            description: '',
            price: '',
            estimated_time: '',
            image_url: '',
            category_id: ''
        });
        setServiceImageFile(null);
        setServiceImagePreview(null);
        setErrorService(null);
    };

    const filteredServices = profileServices.filter(s => 
        !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-wide uppercase flex items-center gap-2">
                        <Icon name="wrench" className="h-5 w-5 text-blue-400" />
                        <span>Gestión de Servicios</span>
                    </h2>
                    <p className="text-xs text-white/40 mt-1">Crea y gestiona la oferta de servicios profesionales de tu perfil.</p>
                </div>
                {!addingService && !editingService && (
                    <Button
                        onClick={() => {
                            resetFormState();
                            setAddingService(true);
                        }}
                        className="bg-blue-500 text-white font-bold text-xs py-2 px-5 hover:bg-blue-600 rounded-none shadow-[0_4px_15px_rgba(59,130,246,0.2)]"
                    >
                        + Agregar Servicio
                    </Button>
                )}
            </div>

            {(addingService || editingService) && (
                <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="rounded-none border border-blue-500/20 bg-white/[0.03] p-6 sm:p-8 space-y-6">
                    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                                {editingService ? 'Editar Servicio Profesional' : 'Configurar Oferta de Servicio Profesional'}
                            </h3>
                            <p className="text-xs text-white/40 mt-1">Completa los detalles del servicio que vas a ofrecer a los clientes.</p>
                        </div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-none">
                            Modo Servicio
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#f5d367]">1. Definición del Servicio</p>
                            <FieldGroup>
                                <Input
                                    label="Título o Especialidad del Servicio *"
                                    name="s_name"
                                    placeholder="Ej: Instalación de Aire Acondicionado, Asesoría Legal"
                                    value={serviceForm.name}
                                    onChange={(e) => setServiceForm(s => ({ ...s, name: e.target.value }))}
                                    required
                                    className="rounded-none"
                                />
                                <div className="space-y-2">
                                    <Select
                                        label="Categoría de Especialidad *"
                                        name="s_category"
                                        value={serviceForm.category_id}
                                        onChange={(e) => setServiceForm(s => ({ ...s, category_id: e.target.value }))}
                                        options={[
                                            { label: 'Selecciona una especialidad', value: '' },
                                            ...categories.filter(c => c.type === 'service').map(c => ({ value: c.id, label: c.name }))
                                        ]}
                                        required
                                        className="rounded-none"
                                    />
                                    {categories.filter(c => c.type === 'service').length === 0 ? (
                                        <p className="text-xs text-amber-400/70">El administrador aún no ha creado categorías de servicios.</p>
                                    ) : (
                                        <p className="text-xs text-white/30">Rubro profesional para clasificar tu labor.</p>
                                    )}
                                </div>
                            </FieldGroup>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#f5d367]">2. Costos y Tiempos de Entrega</p>
                            <FieldGroup>
                                <Input
                                    label="Tarifa o Costo Base (Bs) *"
                                    name="s_price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={serviceForm.price}
                                    onChange={(e) => setServiceForm(s => ({ ...s, price: e.target.value }))}
                                    required
                                    className="rounded-none"
                                />
                                <Input
                                    label="Tiempo Estimado de Ejecución *"
                                    name="s_time"
                                    placeholder="Ej: 2 horas, 1 día laborable, a convenir"
                                    value={serviceForm.estimated_time}
                                    onChange={(e) => setServiceForm(s => ({ ...s, estimated_time: e.target.value }))}
                                    required
                                    className="rounded-none"
                                />
                            </FieldGroup>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#f5d367]">3. Portafolio y Multimedia</p>
                            <Input
                                label={editingService ? "Imagen del servicio (opcional)" : "Imagen de Referencia / Portafolio *"}
                                name="s_image"
                                type="file"
                                accept=".png, .jpg, .jpeg"
                                onChange={handleServiceImageChange}
                                required={!editingService}
                                className="rounded-none"
                            />
                            {serviceImagePreview && (
                                <div className="mt-2">
                                    <p className="text-xs text-white/40 mb-1">Previsualización de la imagen:</p>
                                    <img src={serviceImagePreview} alt="Vista previa" className="h-20 w-20 object-cover rounded-none border border-white/10" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="block space-y-2">
                                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                                    Descripción, Alcance y Exclusiones *
                                </span>
                                <span className="block text-[0.7rem] text-white/40 leading-relaxed">
                                    Describe qué incluye el servicio (ej. materiales básicos, viáticos), qué no incluye (ej. repuestos principales) y qué requisitos debe cumplir el cliente.
                                </span>
                                <textarea
                                    className="w-full rounded-none border border-white/10 bg-slate-900 py-3 px-4 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 min-h-[120px] resize-y"
                                    placeholder="Especifica el alcance del trabajo profesional..."
                                    name="s_desc"
                                    value={serviceForm.description}
                                    onChange={(e) => setServiceForm(s => ({ ...s, description: e.target.value }))}
                                    required
                                />
                            </label>
                        </div>
                    </div>

                    {errorService && (
                        <div className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-none">
                            ⚠️ {errorService}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                        <Button type="button" variant="secondary" className="rounded-none" onClick={resetFormState}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={savingService} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 rounded-none">
                            {editingService ? 'Guardar Cambios' : 'Publicar Oferta de Servicio'}
                        </Button>
                    </div>
                </form>
            )}

            {loadingServices ? (
                <div className="text-sm text-white/40 text-center py-10 animate-pulse">Cargando servicios ofrecidos...</div>
            ) : filteredServices.length === 0 ? (
                <div className="rounded-none border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-sm text-white/40">
                    {searchQuery ? "No se encontraron servicios con la búsqueda actual." : "Aún no has publicado ningún servicio profesional en tu perfil."}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredServices.map(s => {
                        const sImg = s.image_url ? (s.image_url.startsWith('http') ? s.image_url : `${API_BASE}${s.image_url}`) : null;
                        return (
                            <div key={s.id} className="rounded-none border border-white/5 bg-white/[0.03] p-5 flex flex-col justify-between gap-4 hover:border-white/10 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-white truncate">{s.name}</p>
                                        <p className="text-xs text-white/40 mt-1.5 line-clamp-2 leading-relaxed">{s.description || 'Sin descripción'}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-none bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                                        {sImg ? (
                                            <img src={sImg} alt={s.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Icon name="wrench" className="h-5 w-5 text-blue-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                    <span className="rounded-none bg-[#f5d367]/10 text-[#f5d367] border border-[#f5d367]/20 text-[0.7rem] font-bold px-3 py-1">
                                        Bs {Number(s.price).toFixed(2)}
                                    </span>
                                    {s.estimated_time && (
                                        <span className="text-[0.7rem] text-white/40 font-semibold flex items-center gap-1">
                                            <Icon name="clock" className="h-3 w-3 text-white/30" />
                                            <span>{s.estimated_time}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-3 mt-1 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => handleEditServiceClick(s)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-none bg-white/5 hover:bg-blue-500/10 text-xs font-bold text-white/80 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer"
                                    >
                                        <Icon name="edit" className="w-3.5 h-3.5" />
                                        <span>Editar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteService(s.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-none bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-400/80 hover:text-red-400 border border-red-500/5 hover:border-red-500/20 transition-all cursor-pointer"
                                    >
                                        <Icon name="trash" className="w-3.5 h-3.5 text-red-400" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
