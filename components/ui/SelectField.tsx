import { cn } from "@/lib/utils";

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  error?: string[];
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function SelectField({
  label,
  name,
  error,
  options,
  placeholder,
  className,
  ...rest
}: SelectFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-arvo-grafite"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-arvo-grafite/15 focus:border-arvo-terracota",
          className
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error?.[0] && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
    </div>
  );
}
