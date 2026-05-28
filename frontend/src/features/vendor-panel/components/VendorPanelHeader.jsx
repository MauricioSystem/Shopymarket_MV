import React from 'react';
import Button from '@/components/ui/Button';

export function VendorPanelHeader({ setCurrentView, loadData }) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Panel de vendedor</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Crea tu tienda, servicios y catálogo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Usa este panel para crear recursos desde el frontend. Si el backend requiere permisos adicionales, verás el error en pantalla.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setCurrentView('dashboard')}>
            Volver al dashboard
          </Button>
          <Button onClick={loadData}>Actualizar datos</Button>
        </div>
      </div>
    </div>
  );
}
