import React, { useEffect, useState, useMemo } from "react";
import { useUsersData } from "../hooks/useUsersData";
import { getDisplayName, filterAdminUsers } from "@/utils/userCapabilities";
import { normalizeFrontendRole, getRoleLabel, AUTH_ROLES } from "@/utils/authRoles";
import Icon from "../../../components/ui/Icon";

function getInitialsFromName(first, last) {
  const f = first?.[0] || "";
  const l = last?.[0] || "";
  return [f, l].filter(Boolean).join("").toUpperCase() || "?";
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ roleName }) {
  const norm = normalizeFrontendRole(roleName);
  const label = getRoleLabel(roleName);

  let border = "border-white/10";
  let bg = "bg-white/5";
  let text = "text-white/60";

  if (norm === AUTH_ROLES.ADMINISTRATOR) {
    border = "border-red-500/30";
    bg = "bg-red-500/5";
    text = "text-red-400";
  } else if (norm === AUTH_ROLES.VENDOR) {
    border = "border-[#f5d367]/30";
    bg = "bg-[#f5d367]/5";
    text = "text-[#f5d367]";
  } else if (norm === AUTH_ROLES.DELIVERY) {
    border = "border-blue-500/30";
    bg = "bg-blue-500/5";
    text = "text-blue-400";
  } else if (norm === AUTH_ROLES.CUSTOMER) {
    border = "border-green-500/30";
    bg = "bg-green-500/5";
    text = "text-green-400";
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${border} ${bg} ${text}`}>
      {label}
    </span>
  );
}

export default function UsersSection({ token, search, roleFilter, setRoleFilter, onUsersChange }) {
  const {
    users,
    loadState,
    errorMsg,
    modalSubmitting,
    deleteSubmitting,
    fetchUsers,
    addUser,
    updateUser,
    removeUser,
  } = useUsersData(token);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Report changes back to parent if needed for stats
  useEffect(() => {
    if (users && onUsersChange) {
      onUsersChange(users);
    }
  }, [users, onUsersChange]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const initialFormState = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "Bolivia",
    city: "Santa Cruz",
    address: "",
    role_id: "3",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [validationErrors, setValidationErrors] = useState({});
  const [formErrorMsg, setFormErrorMsg] = useState("");

  const displayUsers = useMemo(() => {
    return filterAdminUsers(users);
  }, [users]);

  const filtered = useMemo(() => {
    let list = displayUsers;

    if (roleFilter !== "all") {
      list = list.filter((u) => u.roles?.[0]?.name === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.country?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [displayUsers, search, roleFilter]);

  const roleFilters = [
    { label: "Todos", value: "all" },
    { label: "Vendedores", value: "admin" },
    { label: "Clientes", value: "cliente" },
    { label: "Repartidores", value: "repartidor" },
  ];

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setEditingUser(null);
    setModalMode("add");
    setValidationErrors({});
    setFormErrorMsg("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    let rawPhone = u.phone || "";
    if (rawPhone.startsWith("+591")) {
      rawPhone = rawPhone.substring(4);
    }

    setFormData({
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      email: u.email || "",
      password: "",
      confirmPassword: "",
      phone: rawPhone,
      country: u.country || "Bolivia",
      city: u.city || "Santa Cruz",
      address: u.address || "",
      role_id: String(u.roles?.[0]?.id || "3"),
    });
    setEditingUser(u);
    setModalMode("edit");
    setValidationErrors({});
    setFormErrorMsg("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) {
      errors.first_name = "El nombre es obligatorio.";
    }
    if (!formData.last_name.trim()) {
      errors.last_name = "El apellido es obligatorio.";
    }

    const phoneTrim = formData.phone.trim();
    if (!phoneTrim) {
      errors.phone = "El teléfono es obligatorio.";
    } else if (!/^\d{8}$/.test(phoneTrim)) {
      errors.phone = "El teléfono debe tener exactamente 8 dígitos.";
    }

    if (!formData.country.trim()) {
      errors.country = "El país es obligatorio.";
    }
    if (!formData.city.trim()) {
      errors.city = "La ciudad es obligatoria.";
    }
    if (!formData.address.trim()) {
      errors.address = "La dirección es obligatoria.";
    }

    const emailValue = formData.email.trim().toLowerCase();
    if (!emailValue) {
      errors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      errors.email = "El formato de correo no es válido.";
    } else if (modalMode === "add") {
      const domain = emailValue.split("@")[1];
      if (domain !== "gmail.com" && domain !== "googlemail.com") {
        errors.email = "El correo debe ser de Gmail (@gmail.com o @googlemail.com).";
      }
    } else if (modalMode === "edit" && editingUser) {
      if (emailValue !== editingUser.email.toLowerCase()) {
        const domain = emailValue.split("@")[1];
        if (domain !== "gmail.com" && domain !== "googlemail.com") {
          errors.email = "El correo debe ser de Gmail (@gmail.com o @googlemail.com).";
        }
      }
    }

    if (modalMode === "add") {
      if (!formData.password) {
        errors.password = "La contraseña es obligatoria.";
      } else if (formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres.";
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = "La confirmación de contraseña es obligatoria.";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden.";
      }
    } else {
      if (formData.password) {
        if (formData.password.length < 6) {
          errors.password = "La contraseña debe tener al menos 6 caracteres.";
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = "Las contraseñas no coinciden.";
        }
      }
    }

    return errors;
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setFormErrorMsg("");

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: `+591${formData.phone.trim()}`,
      country: formData.country.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    if (modalMode === "add") {
      payload.email = formData.email.trim().toLowerCase();
      payload.role_id = parseInt(formData.role_id, 10);
    } else {
      if (formData.email.trim().toLowerCase() !== editingUser.email.toLowerCase()) {
        payload.email = formData.email.trim().toLowerCase();
      }
    }

    try {
      if (modalMode === "add") {
        await addUser(payload);
      } else {
        await updateUser(editingUser.id, payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormErrorMsg(err.message || "Error al procesar la solicitud");
    }
  };

  const handleOpenDeleteConfirm = (u) => {
    setUserToDelete(u);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await removeUser(userToDelete.id);
      setUserToDelete(null);
    } catch (err) {
      alert(err.message || "Error al eliminar usuario");
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#080f1c]/40 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Registro de usuarios
          <span className="text-xs font-semibold text-white/30 bg-white/5 rounded-full px-2.5 py-0.5">
            ({filtered.length})
          </span>
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-full border border-white/5 bg-white/[0.02] p-1">
            {roleFilters.map((f) => {
              const isActive = roleFilter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setRoleFilter(f.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "border border-[#f5d367] text-[#f5d367] bg-[#f5d367]/10 shadow-[0_0_12px_rgba(245,211,103,0.15)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="rounded-full border border-[#f5d367] bg-[#f5d367]/10 px-4 py-2 text-xs font-bold text-[#f5d367] hover:bg-[#f5d367]/20 hover:text-white transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(245,211,103,0.1)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar usuario
          </button>
        </div>
      </div>

      {loadState === "loading" && (
        <div className="flex items-center justify-center gap-3 py-24 opacity-40">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#f5d367]" />
          <span className="text-sm font-semibold">Cargando usuarios…</span>
        </div>
      )}

      {loadState === "error" && (
        <div className="flex flex-col items-center justify-center gap-2 py-24">
          <Icon name="alert" className="h-8 w-8 text-red-400 mb-1" />
          <p className="text-sm text-red-400 font-semibold">{errorMsg}</p>
          <p className="text-xs opacity-40">
            Verifica que el backend esté corriendo y tu sesión sea válida.
          </p>
        </div>
      )}

      {loadState === "done" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                  Registro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-sm text-white/40">
                    {search || roleFilter !== "all"
                      ? "No hay usuarios que coincidan con tu búsqueda."
                      : "No hay usuarios registrados aún."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const primaryRole = u.roles?.[0]?.name;
                  const location = [u.city, u.country].filter(Boolean).join(", ") || "—";
                  const fullName = getDisplayName(u);

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[0.7rem] font-bold text-[#f5d367]">
                            {getInitialsFromName(u.first_name, u.last_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-sm text-white">{fullName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-white/70">
                        <span className="truncate">{u.email}</span>
                      </td>

                      <td className="px-6 py-4">
                        <RoleBadge roleName={primaryRole} />
                      </td>

                      <td className="px-6 py-4 text-white/60">{location}</td>

                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" />
                          <span className="text-[#10b981] font-semibold text-xs">Activo</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-white/50">{formatDate(u.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            className="text-white/40 hover:text-[#f5d367] p-1.5 rounded-lg hover:bg-white/5 transition-all"
                            title="Editar usuario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.08a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteConfirm(u)}
                            className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                            title="Eliminar usuario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-[#03070f]/80 backdrop-blur-md"
            onClick={() => !modalSubmitting && setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#080f1c] shadow-2xl transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h3 className="text-lg font-bold text-white">
                {modalMode === "add" ? "Agregar nuevo usuario" : "Editar usuario"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
                disabled={modalSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, first_name: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, first_name: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="Ej. Juan"
                  />
                  {validationErrors.first_name && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, last_name: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, last_name: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="Ej. Pérez"
                  />
                  {validationErrors.last_name && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, email: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="usuario@gmail.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Teléfono</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/40 select-none font-mono">
                      +591
                    </span>
                    <input
                      type="text"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setFormData(prev => ({ ...prev, phone: val }));
                        setValidationErrors(prev => ({ ...prev, phone: "" }));
                      }}
                      className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 pr-4 pl-16 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all font-mono"
                      placeholder="77777777"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">País</label>
                  <select
                    name="country"
                    autoComplete="country-name"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all"
                  >
                    <option value="Bolivia">Bolivia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Ciudad</label>
                  <select
                    name="city"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all"
                  >
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Tarija">Tarija</option>
                    <option value="Beni">Beni</option>
                    <option value="Chuquisaca">Chuquisaca</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Pando">Pando</option>
                    <option value="Potosí">Potosí</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, address: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, address: "" }));
                    }}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                    placeholder="Ej. Calle Av. Las Americas #123"
                  />
                  {validationErrors.address && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    Contraseña {modalMode === "edit" && "(Opcional)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, password: e.target.value }));
                        setValidationErrors(prev => ({ ...prev, password: "" }));
                      }}
                      className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    Confirmar contraseña {modalMode === "edit" && "(Opcional)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm-password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                        setValidationErrors(prev => ({ ...prev, confirmPassword: "" }));
                      }}
                      className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Rol asignado</label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                    disabled={modalMode === "edit"}
                    className="w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#f5d367] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="3">Cliente</option>
                    <option value="2">Vendedor</option>
                    <option value="4">Delivery</option>
                  </select>
                  {modalMode === "edit" && (
                    <p className="text-white/40 text-[0.7rem] mt-1.5 font-medium">
                      * El cambio de roles en edición está deshabilitado temporalmente.
                    </p>
                  )}
                </div>
              </div>

              {formErrorMsg && (
                <p className="text-xs font-semibold text-red-500 text-right mb-4">
                  {formErrorMsg}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSubmitting}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="rounded-full bg-[#f5d367] text-[#120c00] hover:bg-[#ffeb99] transition-colors px-6 py-2.5 text-xs font-bold shadow-[0_4px_16px_rgba(245,211,103,0.15)] flex items-center gap-2 disabled:opacity-50"
                >
                  {modalSubmitting && (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  )}
                  {modalMode === "add" ? "Agregar usuario" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#03070f]/80 backdrop-blur-md"
            onClick={() => !deleteSubmitting && setUserToDelete(null)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#080f1c] shadow-2xl p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar usuario?</h3>
            <p className="text-sm text-white/60 mb-6">
              ¿Estás seguro de que deseas eliminar a <strong className="text-white">{getDisplayName(userToDelete)}</strong>? Esta acción no se puede deshacer y el usuario perderá acceso al sistema.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={deleteSubmitting}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors px-6 py-2.5 text-xs font-bold shadow-[0_4px_16px_rgba(239,68,68,0.2)] flex items-center gap-2 disabled:opacity-50"
              >
                {deleteSubmitting && (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
