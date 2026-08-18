import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string[];
};

export function Field({ label, name, error, className, ...rest }: FieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-arvo-grafite"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={cn(
          "w-full rounded-lg border px-3 py-3 text-sm outline-none",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-arvo-grafite/15 focus:border-arvo-terracota",
          className
        )}
        {...rest}
      />
      {error?.[0] && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
    </div>
  );
}
