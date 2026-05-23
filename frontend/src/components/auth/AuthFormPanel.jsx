import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import AuthField from "@/components/auth/AuthField";
import ModeSwitchLink from "@/components/auth/ModeSwitchLink";
import { cx } from "@/utils/cx";
import { AUTH_ROLES } from "@/utils/authRoles";

const registerFields = [
  {
    name: "first_name",
    label: "Nombre",
    placeholder: "",
    autoComplete: "given-name",
  },
  {
    name: "last_name",
    label: "Apellido",
    placeholder: "",
    autoComplete: "family-name",
  },
  {
    name: "phone",
    label: "Teléfono",
    placeholder: "",
    autoComplete: "tel",
    prefix: "+591",
    maxLength: 8,
  },
  {
    name: "country",
    label: "País",
    type: "select",
    options: ["Bolivia"],
    autoComplete: "country-name",
  },
  {
    name: "city",
    label: "Ciudad",
    type: "select",
    options: [
      "Santa Cruz",
      "Tarija",
      "Beni",
      "Chuquisaca",
      "Cochabamba",
      "La Paz",
      "Oruro",
      "Pando",
      "Potosí",
    ],
    autoComplete: "address-level2",
  },
  {
    name: "address",
    label: "Dirección",
    placeholder: "Calle 123 #45-67",
    autoComplete: "street-address",
  },
];

function AuthFormPanel({
  accessRole,
  isVendorMode,
  formMode,
  formData,
  formErrors,
  formMessage,
  loading,
  onFieldChange,
  onToggleMode,
  onToggleVendorMode,
  onSelectRole,
  roleOptions = [],
  onSubmit,
}) {
  const isRegisterMode = formMode === "register";
  const isReactivateMode = formMode === "reactivate";
  const isDeliveryMode = accessRole === AUTH_ROLES.DELIVERY;
  const isAdministratorMode = accessRole === AUTH_ROLES.ADMINISTRATOR;
  const useDarkShell = isVendorMode || isAdministratorMode;

  const panelShellClass = useDarkShell
    ? "border-white/10 bg-[rgba(8,15,28,0.58)] shadow-[0_30px_100px_-32px_rgba(15,23,42,0.72)]"
    : isDeliveryMode
      ? "border-[rgba(201,147,90,0.24)] bg-[linear-gradient(180deg,rgba(84,51,27,0.98),rgba(56,33,16,0.96))] shadow-[0_30px_100px_-32px_rgba(36,21,11,0.45)] text-[#f4dcc0]"
      : "border-[rgba(245,211,103,0.16)] bg-[rgba(255,252,244,0.9)] shadow-[0_30px_100px_-32px_rgba(39,29,0,0.22)] text-[#1a1200]";

  const mutedTextClass = useDarkShell
    ? "text-white/68"
    : isDeliveryMode
      ? "text-[#e6c79d]"
      : "text-[#6d5f43]";

  const titleTextClass = useDarkShell
    ? "text-white"
    : isDeliveryMode
      ? "text-[#f7d98d]"
      : "text-[#1a1200]";

  const labelTextClass = useDarkShell
    ? "text-white/55"
    : isDeliveryMode
      ? "text-[#f7d98d]"
      : "text-[#8a774f]";

  const dividerClass = useDarkShell
    ? "border-white/10"
    : isDeliveryMode
      ? "border-[rgba(140,90,43,0.16)]"
      : "border-[rgba(201,150,12,0.14)]";

  const deliveryLinkText = "¿Quieres registrarte como delivery? Hazlo aquí.";
  const returnToCustomerText =
    "¿Prefieres volver al modo cliente? Volver aquí.";

  return (
    <section className="relative flex h-full min-h-0 flex-col justify-center px-6 py-6 sm:px-8 lg:px-10 xl:px-12">
      <div
        className={
          isVendorMode
            ? "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,211,103,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]"
            : isDeliveryMode
              ? "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,147,90,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(72,42,20,0.32),transparent_26%),linear-gradient(180deg,rgba(84,51,27,0.92),rgba(44,25,13,0.92))]"
              : "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,141,255,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,211,103,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]"
        }
      />
      <div
        className={
          isVendorMode
            ? "absolute -left-20 top-20 h-56 w-56 rounded-full bg-[rgba(245,211,103,0.12)] blur-3xl"
            : isDeliveryMode
              ? "absolute -left-20 top-16 h-60 w-60 rounded-full bg-[rgba(201,147,90,0.28)] blur-3xl"
              : "absolute -left-20 top-20 h-56 w-56 rounded-full bg-[rgba(91,141,255,0.12)] blur-3xl"
        }
      />
      <div
        className={
          isVendorMode
            ? "absolute bottom-8 right-0 h-64 w-64 rounded-full bg-[rgba(30,41,59,0.28)] blur-3xl"
            : isDeliveryMode
              ? "absolute bottom-8 right-0 h-64 w-64 rounded-full bg-[rgba(247,217,141,0.16)] blur-3xl"
              : "absolute bottom-8 right-0 h-64 w-64 rounded-full bg-[rgba(245,211,103,0.14)] blur-3xl"
        }
      />

      <div className="relative mx-auto w-full max-w-[620px]">
        <div
          className={`rounded-[2rem] p-5 backdrop-blur-2xl sm:p-6 lg:p-7 ${panelShellClass}`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div>
                <h3
                  className={`font-display text-2xl font-bold tracking-tight sm:text-3xl ${titleTextClass}`}
                >
                  {isRegisterMode
                    ? "Crea tu cuenta"
                    : isReactivateMode
                      ? "Reactiva tu cuenta"
                      : "Inicia sesión"}
                </h3>
                <p
                  className={`mt-3 max-w-lg text-sm leading-7 sm:text-[0.95rem] ${mutedTextClass}`}
                >
                  {isReactivateMode
                    ? "Recupera tu cuenta eliminada con el mismo correo y contraseña."
                    : isVendorMode
                      ? "Accede a tu panel para administrar catálogo, ventas y pedidos con una estética más corporativa."
                      : isDeliveryMode
                        ? "Entra a tu experiencia de reparto con acceso ágil y una interfaz más cálida y clara."
                        : "Entra a tu experiencia de compra con un acceso ágil y una interfaz más luminosa."}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-between gap-4 rounded-[1.35rem] border p-1.5 ${
              isVendorMode
                ? "border-white/10 bg-white/5"
                : isDeliveryMode
                  ? "border-[rgba(247,217,141,0.34)] bg-[rgba(110,76,42,0.24)]"
                  : "border-[rgba(201,150,12,0.14)] bg-[rgba(245,211,103,0.08)]"
            }`}
          >
            <button
              type="button"
              onClick={() => onToggleMode('login')}
              className={cx(
                "flex-1 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all duration-300 sm:text-[0.95rem]",
                !isRegisterMode && !isReactivateMode
                  ? isVendorMode
                    ? "bg-white text-[#111827] shadow-[0_12px_30px_-18px_rgba(255,255,255,0.8)]"
                    : isDeliveryMode
                      ? "bg-[#2f1a0d] text-[#f7d98d] shadow-[0_12px_30px_-18px_rgba(36,21,11,0.45)]"
                      : "bg-[#1a1200] text-[#fff8df] shadow-[0_12px_30px_-18px_rgba(26,18,0,0.35)]"
                  : isVendorMode
                    ? "text-white/70 hover:text-white"
                    : isDeliveryMode
                      ? "text-[#f7d98d]/76 hover:text-[#f7d98d]"
                      : "text-[#6b5b3a] hover:text-[#1a1200]",
              )}
            >
              Ingresar
            </button>

            <button
              type="button"
              onClick={() => onToggleMode('register')}
              className={cx(
                "flex-1 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all duration-300 sm:text-[0.95rem]",
                isRegisterMode
                  ? isVendorMode
                    ? "bg-[var(--primary)] text-[#120c00] shadow-glow"
                    : isDeliveryMode
                      ? "bg-[linear-gradient(135deg,#7d4e27,#f7d98d)] text-[#2a1a0d] shadow-[0_16px_36px_-18px_rgba(201,147,90,0.78)]"
                      : "bg-[linear-gradient(135deg,#f6d56d,#d6a208)] text-[#120c00] shadow-[0_16px_36px_-18px_rgba(214,162,8,0.75)]"
                  : isVendorMode
                    ? "text-white/70 hover:text-white"
                    : isDeliveryMode
                      ? "text-[#f7d98d]/76 hover:text-[#f7d98d]"
                      : "text-[#6b5b3a] hover:text-[#1a1200]",
              )}
            >
              Registrarme
            </button>
          </div>

          {formMessage ? (
            <div
              className={`mt-4 rounded-[1.25rem] border px-4 py-3 text-sm ${
                isVendorMode
                  ? "border-white/10 bg-white/6 text-white/85"
                  : isDeliveryMode
                    ? "border-[rgba(247,217,141,0.22)] bg-[rgba(110,76,42,0.22)] text-[#f7d98d]"
                    : "border-[rgba(201,150,12,0.14)] bg-white text-[#1a1200]"
              }`}
            >
              {formMessage}
            </div>
          ) : null}

          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            {isRegisterMode ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {registerFields.map((field) => (
                  <AuthField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={onFieldChange}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    error={formErrors[field.name]}
                    prefix={field.prefix}
                    maxLength={field.maxLength}
                    options={field.options}
                  />
                ))}
              </div>
            ) : null}

            <div className="grid gap-3">
              <AuthField
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={onFieldChange}
                placeholder="correo@gmail.com"
                autoComplete="email"
                error={formErrors.email}
              />

              <AuthField
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={onFieldChange}
                placeholder="••••••••"
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
                error={formErrors.password}
                helperText={
                  isRegisterMode
                    ? "Usa al menos 8 caracteres para una mejor seguridad."
                    : undefined
                }
              />

              {isRegisterMode ? (
                <AuthField
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword || ""}
                  onChange={onFieldChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={formErrors.confirmPassword}
                />
              ) : null}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full rounded-[1.35rem] py-4 text-base"
            >
              {isRegisterMode
                ? "Crear cuenta y continuar"
                : isReactivateMode
                  ? "Reactivar cuenta"
                  : "Entrar a ShopyMarket"}
            </Button>
          </form>

          <div
            className={`mt-4 border-t pt-4 text-sm ${dividerClass} ${mutedTextClass}`}
          >
            {isDeliveryMode ? (
              <>
                <ModeSwitchLink
                  onClick={() => {
                    onSelectRole?.(AUTH_ROLES.CUSTOMER);
                    onToggleMode('login');
                  }}
                  className="block text-[#f7d98d] decoration-[#f7d98d]"
                >
                  {returnToCustomerText}
                </ModeSwitchLink>
                <ModeSwitchLink
                  onClick={onToggleVendorMode}
                  className="mt-3 block"
                >
                  ¿Quieres gestionar tu negocio? Inicia sesión aquí.
                </ModeSwitchLink>
              </>
            ) : isVendorMode ? (
              <>
                <ModeSwitchLink onClick={onToggleVendorMode}>
                  ¿Prefieres comprar como cliente? Volver a modo cliente.
                </ModeSwitchLink>
                <ModeSwitchLink
                  onClick={() => {
                    onSelectRole?.(AUTH_ROLES.DELIVERY);
                    onToggleMode('login');
                  }}
                  className="mt-3 block text-[#8c5a2b] decoration-[#c9935a]"
                >
                  {deliveryLinkText}
                </ModeSwitchLink>
              </>
            ) : (
              <>
                <ModeSwitchLink onClick={onToggleVendorMode}>
                  ¿Quieres gestionar tu negocio? Inicia sesión aquí.
                </ModeSwitchLink>
                <ModeSwitchLink
                  onClick={() => {
                    onSelectRole?.(AUTH_ROLES.DELIVERY);
                    onToggleMode('login');
                  }}
                  className="mt-3 block text-[#8c5a2b] decoration-[#c9935a]"
                >
                  {deliveryLinkText}
                </ModeSwitchLink>
              </>
            )}

            {!isReactivateMode ? (
              <ModeSwitchLink
                onClick={() => onToggleMode('reactivate')}
                className="mt-3 block"
              >
                ¿Tu cuenta fue eliminada? Reactiva tu cuenta aquí.
              </ModeSwitchLink>
            ) : (
              <ModeSwitchLink
                onClick={() => onToggleMode('login')}
                className="mt-3 block"
              >
                Volver a iniciar sesión
              </ModeSwitchLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthFormPanel;
