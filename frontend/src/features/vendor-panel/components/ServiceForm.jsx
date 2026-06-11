import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { createCategory } from '@/services/marketApi';

export function ServiceForm({
  token,
  serviceForm,
  setServiceForm,
  serviceProfiles,
  categories,
  inlineServCatOpen,
  setInlineServCatOpen,
  inlineServCatName,
  setInlineServCatName,
  loadData,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Select
        label="Perfil de servicio"
        name="service_profile_id"
        value={serviceForm.service_profile_id}
        onChange={(event) => setServiceForm((current) => ({ ...current, service_profile_id: event.target.value }))}
        options={[{ label: 'Selecciona un perfil', value: '' }, ...serviceProfiles.map((profile) => ({ value: profile.id, label: profile.name || `Perfil ${profile.id}` }))]}
        required
      />
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Categoría *"
              name="category_id"
              value={serviceForm.category_id}
              onChange={(event) => setServiceForm((current) => ({ ...current, category_id: event.target.value }))}
              options={[{ label: 'Selecciona una categoría', value: '' }, ...categories.filter(c => c && c.type === 'service').map((category) => ({ value: category.id, label: category.name || `Categoría ${category.id}` }))]}
              required
            />
          </div>
          <button
            type="button"
            onClick={() => setInlineServCatOpen(prev => !prev)}
            className="h-10 px-3 bg-slate-900 border border-slate-200 text-[#0f172a] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
          >
            + Crear
          </button>
        </div>
        {inlineServCatOpen && (
          <div className="p-3 border border-slate-200 rounded-xl space-y-2 mt-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Nueva Categoría de Servicio</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: Plomería, Diseño..."
                value={inlineServCatName}
                onChange={(e) => setInlineServCatName(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!inlineServCatName) return;
                  try {
                    const newCat = await createCategory(token, { name: inlineServCatName, type: 'service' });
                    const savedCat = newCat?.data || newCat;
                    if (savedCat) {
                      setServiceForm(s => ({ ...s, category_id: savedCat.id }));
                      await loadData();
                    }
                    setInlineServCatName('');
                    setInlineServCatOpen(false);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:opacity-90"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setInlineServCatOpen(false)}
                className="border border-slate-200 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-slate-50"
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
      <Input
        label="Nombre del servicio"
        name="name"
        value={serviceForm.name}
        onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))}
        required
      />
      <Input
        label="Precio"
        name="price"
        type="number"
        step="0.01"
        value={serviceForm.price}
        onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))}
        required
        prefix="$"
      />
      <Input
        label="Tiempo estimado"
        name="estimated_time"
        value={serviceForm.estimated_time}
        onChange={(event) => setServiceForm((current) => ({ ...current, estimated_time: event.target.value }))}
      />
      <Input
        label="URL de imagen"
        name="image_url"
        value={serviceForm.image_url}
        onChange={(event) => setServiceForm((current) => ({ ...current, image_url: event.target.value }))}
      />
      <Input
        label="Descripción"
        name="description"
        value={serviceForm.description}
        onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))}
      />
    </div>
  );
}
