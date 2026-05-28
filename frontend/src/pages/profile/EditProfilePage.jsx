import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";
import { getDisplayName, getProfileImageUrl } from "@/utils/userCapabilities";
import { getRoleLabel, AUTH_ROLES } from "@/utils/authRoles";
import { updateUserProfileMultipart } from "@/services/usersApi";

const BOLIVIAN_DEPARTMENTS = [
  "Santa Cruz",
  "La Paz",
  "Cochabamba",
  "Oruro",
  "Potosí",
  "Tarija",
  "Chuquisaca",
  "Beni",
  "Pando"
];

const ArrowLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const PhotoIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);

export default function EditProfilePage() {
  const { token, user, role, setCurrentView, updateSessionUser } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  
  const getInitialPhoneDigits = () => {
    if (!user?.phone) return "";
    return user.phone.replace("+591", "").replace(/\D/g, "");
  };
  
  const [phone, setPhone] = useState(getInitialPhoneDigits());
  const [country, setCountry] = useState(user?.country || "Bolivia");
  const [city, setCity] = useState(user?.city || "Santa Cruz");
  const [address, setAddress] = useState(user?.address || "");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const fileInputRef = useRef(null);

  const getTheme = () => {
    switch (role) {
      case AUTH_ROLES.ADMINISTRATOR:
        return {
          mode: "admin",
          mainClass: "min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(4,9,18,0.8),transparent_25%),linear-gradient(180deg,#02060d,#050c18)]",
          headerClass: "border-b border-white/5 bg-[#030814]/80 backdrop-blur-xl",
          cardClass: "border border-white/5 bg-white/[0.03] backdrop-blur-md rounded-3xl p-8 shadow-2xl",
          inputClass: "w-full bg-[#040912]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all",
          inputDisabledClass: "w-full bg-[#040912]/30 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white/50 cursor-not-allowed",
          mutedText: "text-white/60",
          titleText: "text-white",
          accentText: "text-[#f5d367]",
          buttonClass: "bg-[#f5d367] text-[#120c00] hover:bg-[#ffeb99] transition-all duration-200",
          secondaryBtnClass: "border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-200",
          dividerClass: "border-white/5"
        };
      case AUTH_ROLES.VENDOR:
        return {
          mode: "vendor",
          mainClass: "min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.14),transparent_28%),radial-gradient(circle_at_right_15%,rgba(255,255,255,0.04),transparent_24%),linear-gradient(145deg,rgba(4,9,18,0.98),rgba(11,17,31,0.96))]",
          headerClass: "border-b border-white/5 bg-[rgba(6,12,22,0.7)] backdrop-blur-xl",
          cardClass: "border border-white/8 bg-[rgba(8,15,28,0.48)] backdrop-blur-md rounded-3xl p-8 shadow-xl",
          inputClass: "w-full bg-[#050c14]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#f5d367] transition-all",
          inputDisabledClass: "w-full bg-[#050c14]/30 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white/50 cursor-not-allowed",
          mutedText: "text-white/60",
          titleText: "text-white",
          accentText: "text-[#f5d367]",
          buttonClass: "bg-[#f5d367] text-[#120c00] hover:opacity-90 shadow-[0_4px_16px_rgba(245,211,103,0.16)]",
          secondaryBtnClass: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
          dividerClass: "border-white/5"
        };
      case AUTH_ROLES.DELIVERY:
        return {
          mode: "delivery",
          mainClass: "min-h-screen text-[#f4dcc0] bg-[radial-gradient(circle_at_top_right,rgba(201,147,90,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(72,42,20,0.22),transparent_26%),linear-gradient(180deg,rgba(56,33,16,0.98),rgba(44,25,13,0.96))]",
          headerClass: "border-b border-[rgba(201,147,90,0.12)] bg-[rgba(44,25,13,0.78)] backdrop-blur-xl",
          cardClass: "border border-[rgba(201,147,90,0.16)] bg-[rgba(110,76,42,0.24)] backdrop-blur-md rounded-3xl p-8 shadow-xl",
          inputClass: "w-full bg-[#2a170a]/80 border border-[rgba(201,147,90,0.2)] rounded-2xl py-3 px-4 text-sm text-[#f4dcc0] placeholder-[#f4dcc0]/35 outline-none focus:border-[#f7d98d] transition-all",
          inputDisabledClass: "w-full bg-[#2a170a]/30 border border-[rgba(201,147,90,0.08)] rounded-2xl py-3 px-4 text-sm text-[#f4dcc0]/50 cursor-not-allowed",
          mutedText: "text-[#e6c79d]/80",
          titleText: "text-[#f7d98d]",
          accentText: "text-[#f7d98d]",
          buttonClass: "bg-[linear-gradient(135deg,#7d4e27,#f7d98d)] text-[#2a1a0d] hover:opacity-90 shadow-[0_8px_20px_-10px_rgba(201,147,90,0.5)]",
          secondaryBtnClass: "border border-[rgba(201,147,90,0.2)] bg-[rgba(110,76,42,0.1)] text-[#f4dcc0] hover:bg-[rgba(110,76,42,0.2)]",
          dividerClass: "border-[rgba(201,147,90,0.12)]"
        };
      default: // CUSTOMER
        return {
          mode: "customer",
          mainClass: "min-h-screen text-[#1a1200] bg-[radial-gradient(circle_at_top_left,rgba(91,141,255,0.06),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,211,103,0.1),transparent_26%),linear-gradient(180deg,rgba(255,252,244,0.98),rgba(249,244,231,0.96))]",
          headerClass: "border-b border-[rgba(201,150,12,0.1)] bg-[rgba(255,252,244,0.72)] backdrop-blur-xl",
          cardClass: "border border-[rgba(201,150,12,0.12)] bg-[rgba(255,255,255,0.65)] backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_50px_-20px_rgba(39,29,0,0.08)]",
          inputClass: "w-full bg-[#fdfaf2] border border-[rgba(201,150,12,0.16)] rounded-2xl py-3 px-4 text-sm text-[#1a1200] placeholder-[#6d5f43]/40 outline-none focus:border-[#c8960c] transition-all focus:ring-2 focus:ring-[#c8960c]/10",
          inputDisabledClass: "w-full bg-[#f5efe2] border border-[rgba(201,150,12,0.08)] rounded-2xl py-3 px-4 text-sm text-[#1a1200]/50 cursor-not-allowed",
          mutedText: "text-[#6d5f43]",
          titleText: "text-[#1a1200]",
          accentText: "text-[#c8960c]",
          buttonClass: "bg-[linear-gradient(135deg,#f6d56d,#d6a208)] text-[#120c00] hover:opacity-90 shadow-[0_8px_20px_-10px_rgba(214,162,8,0.5)]",
          secondaryBtnClass: "border border-[rgba(201,150,12,0.16)] bg-white text-[#1a1200] hover:bg-neutral-50",
          dividerClass: "border-[rgba(201,150,12,0.08)]"
        };
    }
  };

  const theme = getTheme();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      setPhone(value);
    }
  };

  const handleFileChange = (e) => {
    setValidationError("");
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setValidationError("La imagen debe pesar menos de 2MB.");
      return;
    }

    const allowedExtensions = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedExtensions.includes(file.type)) {
      setValidationError("Solo se permiten imágenes PNG o JPEG.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setApiError("");
    setSuccessMsg("");

    if (!firstName.trim()) {
      setValidationError("El nombre es requerido.");
      return;
    }

    if (!email.trim()) {
      setValidationError("El correo electrónico es requerido.");
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const domain = emailLower.split("@")[1];
    if (domain !== "gmail.com" && domain !== "googlemail.com") {
      setValidationError("El correo electrónico debe usar el dominio gmail.com o googlemail.com.");
      return;
    }

    if (phone && phone.length !== 8) {
      setValidationError("El número de teléfono boliviano debe tener exactamente 8 dígitos.");
      return;
    }

    if (password) {
      if (password.length < 6) {
        setValidationError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setValidationError("Las contraseñas no coinciden.");
        return;
      }
    }

    if (!address.trim()) {
      setValidationError("La dirección es requerida.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      
      if (emailLower !== user.email?.toLowerCase().trim()) {
        formData.append("email", emailLower);
      }
      
      if (phone) {
        formData.append("phone", `+591${phone}`);
      } else {
        formData.append("phone", "");
      }
      
      formData.append("country", country);
      formData.append("city", city);
      formData.append("address", address.trim());
      
      if (password) {
        formData.append("password", password);
      }

      if (selectedFile) {
        formData.append("profile_image", selectedFile);
      }

      const result = await updateUserProfileMultipart(token, user.id, formData);

      if (result.success) {
        setSuccessMsg("¡Perfil actualizado con éxito!");
        updateSessionUser(result.data);
        
        setTimeout(() => {
          setCurrentView("profile");
        }, 1500);
      } else {
        setApiError(result.message || "Error al actualizar el perfil.");
      }
    } catch (err) {
      setApiError(err.message || "Error de red al actualizar el perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentPhotoUrl = previewUrl || (user?.profile_image_url ? getProfileImageUrl(user.profile_image_url) : null);

  const getInitialsText = () => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return [f, l].filter(Boolean).join("").toUpperCase() || "?";
  };

  return (
    <main data-mode={theme.mode} className={`min-h-screen theme-transition pb-16 ${theme.mainClass}`}>
      <header className={`sticky top-0 z-30 px-6 py-3.5 ${theme.headerClass}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandMark mode={theme.mode} tone={theme.mode === "customer" ? "dark" : "light"} />
            <div className={`hidden h-5 w-px ${theme.dividerClass} sm:block`} />
            <div className="hidden sm:block">
              <p className={`text-xs font-semibold opacity-85 ${theme.titleText}`}>Editar Perfil</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              disabled={submitting}
              onClick={() => setCurrentView("profile")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${theme.secondaryBtnClass}`}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Cancelar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className={`${theme.cardClass}`}>
          <div className="mb-8 border-b pb-6 ${theme.dividerClass}">
            <h1 className={`text-2xl font-extrabold ${theme.titleText}`}>Información de Perfil</h1>
            <p className={`text-xs mt-1.5 ${theme.mutedText}`}>Actualiza tus datos de usuario, contraseña e imagen de perfil.</p>
          </div>



          {successMsg && (
            <div className="mb-6 rounded-2xl bg-green-500/10 border border-green-500/20 p-4 text-xs font-semibold text-green-400">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="flex flex-col items-center sm:flex-row gap-6">
              <div className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 ${theme.dividerClass} bg-neutral-500/5 overflow-hidden shadow-md`}>
                {currentPhotoUrl ? (
                  <img src={currentPhotoUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className={`text-2xl font-bold ${theme.accentText}`}>{getInitialsText()}</span>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className={`text-sm font-bold ${theme.titleText}`}>Foto de Perfil</h3>
                <p className={`text-xs ${theme.mutedText} mt-1 mb-3`}>Formatos soportados: PNG, JPG o JPEG. Máx. 2MB.</p>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${theme.secondaryBtnClass}`}
                >
                  <PhotoIcon className="h-4 w-4" />
                  <span>Seleccionar Foto</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Nombre</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Juan"
                  className={theme.inputClass}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Pérez"
                  className={theme.inputClass}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className={theme.inputClass}
                />
                <p className="text-[0.65rem] opacity-50 mt-1.5">Debe ser @gmail.com o @googlemail.com</p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Teléfono de Contacto</label>
                <div className="relative flex items-center">
                  <span className={`absolute left-4 text-sm font-semibold opacity-60 ${theme.mode === 'customer' ? 'text-[#1a1200]' : 'text-white'}`}>
                    +591
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="77000000"
                    className={`${theme.inputClass} pl-16`}
                  />
                </div>
                <p className="text-[0.65rem] opacity-50 mt-1.5">Exactamente 8 dígitos numéricos bolivianos</p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>País</label>
                <select
                  disabled
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={theme.inputDisabledClass}
                >
                  <option value="Bolivia">Bolivia (Predeterminado)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Ciudad (Departamento)</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full appearance-none pr-10 ${theme.inputClass}`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {BOLIVIAN_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="text-black">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Dirección Completa</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Calle Aroma #450, Entre 24 de Septiembre y Libertad"
                className={`${theme.inputClass} resize-none py-3`}
              />
            </div>

            <div className={`border-t pt-8 ${theme.dividerClass} space-y-6`}>
              <div>
                <h3 className={`text-sm font-bold ${theme.titleText}`}>Cambiar Contraseña</h3>
                <p className={`text-xs ${theme.mutedText} mt-1`}>Completa estos campos solo si deseas cambiar tu contraseña actual.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Nueva Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={theme.inputClass}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.mutedText}`}>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={theme.inputClass}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {(validationError || apiError) && (
              <p className="text-xs font-semibold text-red-500 text-right mt-4">
                {validationError || apiError}
              </p>
            )}

            <div className={`border-t pt-8 ${theme.dividerClass} flex justify-end gap-3`}>
              <Button
                type="button"
                disabled={submitting}
                onClick={() => setCurrentView("profile")}
                className={`rounded-xl px-5 py-3 text-xs font-bold ${theme.secondaryBtnClass}`}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className={`rounded-xl px-6 py-3 text-xs font-bold ${theme.buttonClass}`}
              >
                {submitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
