import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export function StoreForm({ storeForm, setStoreForm, setLogoFile, setBannerFile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Input
        label="Nombre de la tienda *"
        name="name"
        value={storeForm.name}
        onChange={(event) => setStoreForm((current) => ({ ...current, name: event.target.value }))}
        required
      />
      <Select
        label="País"
        name="country"
        value={storeForm.country}
        onChange={(event) => setStoreForm((current) => ({ ...current, country: event.target.value }))}
        options={["Bolivia"]}
      />
      <Select
        label="Ciudad"
        name="city"
        value={storeForm.city}
        onChange={(event) => setStoreForm((current) => ({ ...current, city: event.target.value }))}
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
      <Input
        label="Dirección"
        name="address"
        value={storeForm.address}
        onChange={(event) => setStoreForm((current) => ({ ...current, address: event.target.value }))}
      />
      <Input
        label="Descripción"
        name="description"
        value={storeForm.description}
        onChange={(event) => setStoreForm((current) => ({ ...current, description: event.target.value }))}
      />
      <Input
        label="Color de fondo"
        name="background_color"
        type="color"
        value={storeForm.background_color}
        onChange={(event) => setStoreForm((current) => ({ ...current, background_color: event.target.value }))}
      />
      <Input
        label="Logo de la tienda"
        name="logo"
        type="file"
        accept=".png, .jpg, .jpeg"
        onChange={(event) => setLogoFile(event.target.files[0])}
      />
      <Input
        label="Banner de la tienda"
        name="banner"
        type="file"
        accept=".png, .jpg, .jpeg"
        onChange={(event) => setBannerFile(event.target.files[0])}
      />
    </div>
  );
}
