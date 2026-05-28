import React from 'react';

const VENDOR_MODES = [
  { value: 'store', label: 'Tienda' },
  { value: 'serviceProfile', label: 'Perfil de servicio' },
  { value: 'service', label: 'Servicio' },
  { value: 'product', label: 'Producto' },
  { value: 'subcategory', label: 'Subcategoría' },
];

export function VendorPanelSidebar({
  mode,
  setMode,
  setSuccess,
  setError,
  stores,
  serviceProfiles,
  categories,
  subcategories,
}) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Crear</p>
      <div className="mt-4 space-y-3">
        {VENDOR_MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setMode(item.value);
              setSuccess(null);
              setError(null);
            }}
            className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${mode === item.value ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold">Estado del panel</p>
        <p className="mt-3">Tiendas: {stores.length}</p>
        <p className="mt-1">Perfiles: {serviceProfiles.length}</p>
        <p className="mt-1">Categorías: {categories.length}</p>
        <p className="mt-1">Subcategorías: {subcategories.length}</p>
      </div>
    </aside>
  );
}
