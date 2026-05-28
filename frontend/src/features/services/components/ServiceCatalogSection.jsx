import React, { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useServiceCatalog } from '../hooks/useServiceCatalog';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

function FieldGroup({ children }) {
    return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function ServiceCatalogSection({
    token,
    existingServiceProfile,
    categories,
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
        serviceImageFile,
        serviceImagePreview,
        setServiceImageFile,
        setServiceImagePreview,
        handleServiceImageChange,
        loadProfileServices,
        handleCreateService,
    } = useServiceCatalog({ token, existingServiceProfile });

    useEffect(() => {
        if (existingServiceProfile?.id) {
            loadProfileServices(existingServiceProfile.id);
        }
    }, [existingServiceProfile?.id, loadProfileServices]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">🔧 Gestión de Servicios</h2>
                    <p className="text-xs text-white/40 mt-1">Crea y gestiona la oferta de servicios profesionales de tu perfil.</p>
                </div>
                {!addingService && (
                    <Button
                        onClick={() => setAddingService(true)}
                        className="bg-blue-500 text-white font-bold text-xs py-2 px-5 hover:bg-blue-600 shadow-[0_4px_15px_rgba(59,130,246,0.2)]"
                    >
                        + Agregar Servicio
                    </Button>
                )}
            </div>

            {addingService && (
                <form onSubmit={handleCreateService} className="rounded-2xl border border-blue-500/20 bg-white/[0.03] p-6 sm:p-8 space-y-6">
                    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Configurar Oferta de Servicio Profesional</h3>
                            <p className="text-xs text-white/40 mt-1">Completa los detalles del servicio que vas a ofrecer a los clientes.</p>
                        </div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-lg">
                            Modo Servicio
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Grupo 1: Definición de Servicio */}
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
                                    helperText="Nombre comercial claro de la labor que realizarás."
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
                                    />
                                    {categories.filter(c => c.type === 'service').length === 0 ? (
                                        <p className="text-xs text-amber-400/70">⚠️ El administrador aún no ha creado categorías de servicios.</p>
                                    ) : (
                                        <p className="text-xs text-white/30">Rubro profesional para clasificar tu labor.</p>
                                    )}
                                </div>
                            </FieldGroup>
                        </div>

                        {/* Grupo 2: Esquema de Tarifas y Tiempos */}
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
                                    helperText="Costo base o precio inicial estimado del servicio."
                                />
                                <Input
                                    label="Tiempo Estimado de Ejecución *"
                                    name="s_time"
                                    placeholder="Ej: 2 horas, 1 día laborable, a convenir"
                                    value={serviceForm.estimated_time}
                                    onChange={(e) => setServiceForm(s => ({ ...s, estimated_time: e.target.value }))}
                                    required
                                    helperText="Duración aproximada del trabajo a realizar."
                                />
                            </FieldGroup>
                        </div>

                        {/* Grupo 3: Portafolio e Imagen */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#f5d367]">3. Portafolio y Multimedia</p>
                            <Input
                                label="Imagen de Referencia / Portafolio *"
                                name="s_image"
                                type="file"
                                accept=".png, .jpg, .jpeg"
                                onChange={handleServiceImageChange}
                                required
                                helperText="Sube una foto que ilustre tu trabajo o portafolio previo. Formatos: PNG, JPG, JPEG. Máx: 5MB"
                            />
                            {serviceImagePreview && (
                                <div className="mt-2">
                                    <p className="text-xs text-white/40 mb-1">Previsualización de la imagen:</p>
                                    <img src={serviceImagePreview} alt="Vista previa del servicio" className="h-20 w-20 object-cover rounded-xl border border-white/10" />
                                </div>
                            )}
                        </div>

                        {/* Grupo 4: Alcance y Exclusiones */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="block space-y-2">
                                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                                    Descripción, Alcance y Exclusiones *
                                </span>
                                <span className="block text-[0.7rem] text-white/40 leading-relaxed">
                                    Describe qué incluye el servicio (ej. materiales básicos, viáticos), qué no incluye (ej. repuestos principales) y qué requisitos debe cumplir el cliente (ej. acceso a agua/electricidad).
                                </span>
                                <textarea
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] py-3 px-4 text-sm text-[var(--text)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] min-h-[120px] resize-y"
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
                        <div className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                            ⚠️ {errorService}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                        <Button type="button" variant="secondary" onClick={() => {
                            setAddingService(false);
                            setServiceImageFile(null);
                            setServiceImagePreview(null);
                        }}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={savingService} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6">
                            Publicar Oferta de Servicio
                        </Button>
                    </div>
                </form>
            )}

            {loadingServices ? (
                <div className="text-sm text-white/40 text-center py-10 animate-pulse">Cargando servicios ofrecidos...</div>
            ) : profileServices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-sm text-white/40">
                    🔧 Aún no has publicado ningún servicio profesional en tu perfil.
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {profileServices.map(s => {
                        const sImg = s.image_url ? (s.image_url.startsWith('http') ? s.image_url : `${API_BASE}${s.image_url}`) : null;
                        return (
                            <div key={s.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 flex flex-col justify-between gap-4 hover:border-white/10 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-white truncate">{s.name}</p>
                                        <p className="text-xs text-white/40 mt-1.5 line-clamp-2 leading-relaxed">{s.description || 'Sin descripción'}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl shrink-0">
                                        {sImg ? (
                                            <img src={sImg} alt={s.name} className="h-full w-full object-cover rounded-2xl" />
                                        ) : (
                                            '🔧'
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                    <span className="rounded-full bg-[#f5d367]/10 text-[#f5d367] border border-[#f5d367]/20 text-[0.7rem] font-bold px-3 py-1">
                                        Bs {Number(s.price).toFixed(2)}
                                    </span>
                                    {s.estimated_time && (
                                        <span className="text-[0.7rem] text-white/40 font-semibold">⏱ {s.estimated_time}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
