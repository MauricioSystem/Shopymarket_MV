import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

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
  prefix,
  options,
  ...props
}) {
  if (type === "select") {
    return (
      <Select
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        options={options}
        className={className}
        {...props}
      />
    );
  }

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
      prefix={prefix}
      {...props}
    />
  );
}

export default AuthField;
