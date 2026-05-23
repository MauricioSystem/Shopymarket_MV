import { useEffect, useState } from "react";
import AuthHero from "@/components/auth/AuthHero";
import AuthFormPanel from "@/components/auth/AuthFormPanel";
import { useAuth } from "@/context/AuthContext";
import {
  AUTH_ROLES,
  ROLE_OPTIONS,
  getRoleId,
  normalizeFrontendRole,
} from "@/utils/authRoles";

const customerFormDefaults = {
  first_name: "",
  last_name: "",
  phone: "",
  country: "Bolivia",
  city: "Santa Cruz",
  address: "",
  email: "",
  password: "",
  confirmPassword: "",
  rememberMe: false,
};

const sanitizeRegisterPayload = (formData) => ({
  first_name: formData.first_name.trim(),
  last_name: formData.last_name.trim(),
  phone: `+591${formData.phone.trim()}`,
  country: formData.country.trim(),
  city: formData.city.trim(),
  address: formData.address.trim(),
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
});

const sanitizeLoginPayload = (formData) => ({
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
});

const validateForm = (formMode, formData) => {
  const errors = {};

  if (formMode === "register") {
    if (!formData.first_name.trim())
      errors.first_name = "El nombre es obligatorio.";
    if (!formData.last_name.trim())
      errors.last_name = "El apellido es obligatorio.";
    if (!formData.phone.trim()) {
      errors.phone = "El teléfono es obligatorio.";
    } else if (!/^\d{8}$/.test(formData.phone.trim())) {
      errors.phone = "El teléfono debe tener exactamente 8 dígitos.";
    }
    if (!formData.country.trim()) errors.country = "El país es obligatorio.";
    if (!formData.city.trim()) errors.city = "La ciudad es obligatoria.";
    if (!formData.address.trim())
      errors.address = "La dirección es obligatoria.";
    if (!formData.confirmPassword) {
      errors.confirmPassword = "La confirmación de contraseña es obligatoria.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
  }

  const emailValue = formData.email.trim().toLowerCase();
  if (!emailValue) {
    errors.email = "El correo es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    errors.email = "El formato de correo no es válido.";
  } else if (formMode === "register") {
    const domain = emailValue.split("@")[1];
    if (domain !== "gmail.com" && domain !== "googlemail.com") {
      errors.email = "El correo debe ser de Gmail (@gmail.com o @googlemail.com).";
    }
  }

  if (!formData.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (formData.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  return errors;
};

function AuthPage() {
  const {
    login,
    register,
    isVendorMode: persistedVendorMode,
    actionContext,
    isAuthenticated,
    user,
    role,
    dashboardPath,
    loading,
    error,
    clearError,
    isHydrated,
  } = useAuth();
  const [accessRole, setAccessRole] = useState(
    normalizeFrontendRole(actionContext?.role) ||
      (persistedVendorMode ? AUTH_ROLES.VENDOR : AUTH_ROLES.CUSTOMER),
  );
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState(customerFormDefaults);
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

  const isVendorMode =
    accessRole === AUTH_ROLES.VENDOR || accessRole === AUTH_ROLES.ADMINISTRATOR;

  useEffect(() => {
    if (isHydrated) {
      const hydratedRole = normalizeFrontendRole(actionContext?.role);
      setAccessRole(
        hydratedRole ||
          (persistedVendorMode ? AUTH_ROLES.VENDOR : AUTH_ROLES.CUSTOMER),
      );
    }
  }, [isHydrated, actionContext?.role, persistedVendorMode]);

  useEffect(() => {
    if (error) {
      setFormMessage(error);
    }
  }, [error]);

  const handleFieldChange = (event) => {
    const { name, type, value, checked } = event.target;

    let finalValue = type === "checkbox" ? checked : value;
    if (name === "phone") {
      finalValue = value.replace(/\D/g, "").slice(0, 8);
    }

    setFormData((current) => ({
      ...current,
      [name]: finalValue,
    }));

    if (formErrors[name]) {
      setFormErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[name];
        return nextErrors;
      });
    }

    if (formMessage) {
      setFormMessage("");
      clearError();
    }
  };

  const handleModeChange = (nextVendorMode) => {
    setAccessRole(nextVendorMode ? AUTH_ROLES.VENDOR : AUTH_ROLES.CUSTOMER);
    clearError();
    setFormMessage("");
  };

  const handleRoleChange = (nextRole) => {
    setAccessRole(normalizeFrontendRole(nextRole) || AUTH_ROLES.CUSTOMER);
    clearError();
    setFormMessage("");
  };

  const handleIntentChange = (nextRegisterMode) => {
    setIsRegisterMode(nextRegisterMode);
    setFormErrors({});
    clearError();
    setFormMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(
      isRegisterMode ? "register" : "login",
      formData,
    );
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = isRegisterMode
      ? sanitizeRegisterPayload(formData)
      : sanitizeLoginPayload(formData);
    const roleId = getRoleId(accessRole);

    try {
      const result = isRegisterMode
        ? await register(
            {
              ...payload,
              role_id: roleId,
              role: accessRole,
            },
            { isVendorMode, entryPoint: "register", role: accessRole, roleId },
          )
        : await login(payload, {
            isVendorMode,
            entryPoint: "login",
            role: accessRole,
            roleId,
          });

      setFormMessage(
        `Sesión ${isRegisterMode ? "creada" : "iniciada"} con éxito. Rol real: ${result.role || "sin definir"} · Destino sugerido: ${result.dashboardPath}`,
      );
      setFormData(customerFormDefaults);
    } catch {
    }
  };

  return (
    <main
      data-mode={accessRole === AUTH_ROLES.ADMINISTRATOR ? AUTH_ROLES.VENDOR : accessRole}
      className="min-h-screen overflow-hidden theme-transition"
    >
      <div
        className={
          isVendorMode
            ? "relative min-h-screen text-white bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.18),transparent_24%),radial-gradient(circle_at_right_15%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(145deg,rgba(4,9,18,0.98),rgba(11,17,31,0.96))]"
            : "relative min-h-screen text-[#1a1200] bg-[radial-gradient(circle_at_top_left,rgba(245,211,103,0.34),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(91,141,255,0.12),transparent_26%),linear-gradient(145deg,rgba(255,252,244,0.98),rgba(249,244,231,0.95))]"
        }
      >
        <div
          className={
            isVendorMode
              ? "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-16 [mask-image:linear-gradient(to_bottom,white,transparent_92%)]"
              : "absolute inset-0 bg-[linear-gradient(rgba(26,18,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,18,0,0.05)_1px,transparent_1px)] bg-[size:48px_48px] opacity-24 [mask-image:linear-gradient(to_bottom,white,transparent_92%)]"
          }
        />

        <div className="relative grid min-h-screen lg:grid-cols-[0.95fr_1.05fr] xl:grid-cols-[0.9fr_1.1fr]">
          <div
            className={
              isVendorMode
                ? "relative border-b border-white/8 lg:border-b-0 lg:border-r lg:border-white/8 min-w-0 overflow-hidden"
                : "relative border-b border-white/12 lg:border-b-0 lg:border-r lg:border-white/12 min-w-0 overflow-hidden"
            }
          >
            <AuthHero
              accessRole={accessRole}
              isVendorMode={isVendorMode}
              onToggleVendorMode={handleModeChange}
              onSelectRole={handleRoleChange}
            />
          </div>

          <div
            className={
              isVendorMode
                ? "relative bg-[linear-gradient(180deg,rgba(8,14,26,0.34),rgba(5,9,18,0.1))]"
                : accessRole === AUTH_ROLES.DELIVERY
                  ? "relative bg-[radial-gradient(circle_at_top_left,rgba(72,42,20,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(201,147,90,0.18),transparent_30%),linear-gradient(180deg,rgba(66,40,20,0.96),rgba(98,65,36,0.94))]"
                  : "relative bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]"
            }
          >
            <AuthFormPanel
              accessRole={accessRole}
              isVendorMode={isVendorMode}
              isRegisterMode={isRegisterMode}
              formData={formData}
              formErrors={formErrors}
              formMessage={formMessage}
              loading={loading}
              onFieldChange={handleFieldChange}
              onToggleMode={handleIntentChange}
              onToggleVendorMode={() => handleModeChange(!isVendorMode)}
              onSelectRole={handleRoleChange}
              roleOptions={ROLE_OPTIONS}
              onSubmit={handleSubmit}
            />
          </div>
        </div>


      </div>
    </main>
  );
}

export default AuthPage;
