import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export function ServiceProfileForm({
  profileForm,
  setProfileForm,
  stores,
  setServiceLogoFile,
  setServiceBannerFile,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Select
        label="Tienda asociada (opcional)"
        name="store_id"
        value={profileForm.store_id}
        onChange={(event) => setProfileForm((current) => ({ ...current, store_id: event.target.value }))}
        options={[{ label: 'Sin tienda', value: '' }, ...stores.map((store) => ({ value: store.id, label: store.name || `Tienda ${store.id}` }))]}
      />
      <Input
        label="Nombre del perfil"
        name="name"
        value={profileForm.name}
        onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
        required
      />
      <Input
        label="Descripción"
        name="description"
        value={profileForm.description}
        onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))}
      />
      <Input
        label="Color de fondo"
        name="background_color"
        type="color"
        value={profileForm.background_color}
        onChange={(event) => setProfileForm((current) => ({ ...current, background_color: event.target.value }))}
      />
      <Input
        label="Logo o Imagen de perfil"
        name="logo"
        type="file"
        accept=".png, .jpg, .jpeg"
        onChange={(event) => setServiceLogoFile(event.target.files[0])}
      />
      <Input
        label="Banner de perfil"
        name="banner"
        type="file"
        accept=".png, .jpg, .jpeg"
        onChange={(event) => setServiceBannerFile(event.target.files[0])}
      />
      <Select
        label="País"
        name="country"
        value={profileForm.country}
        onChange={(event) => setProfileForm((current) => ({ ...current, country: event.target.value }))}
        options={["Bolivia"]}
      />
      <Select
        label="Ciudad"
        name="city"
        value={profileForm.city}
        onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))}
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
        value={profileForm.address}
        onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))}
      />
    </div>
  );
}
