import Input from "@/components/Atoms/Input";

function AuthField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  helperText,
  placeholder,
  autoComplete,
  className,
}) {
  return (
    <Input
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={className}
    />
  );
}

export default AuthField;
