import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger";

const BASE =
  "inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition disabled:opacity-60";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-arvo-terracota text-arvo-bg hover:opacity-90",
  secondary:
    "border border-arvo-terracota/30 text-arvo-terracota hover:bg-arvo-terracota/5",
  danger: "border border-red-300 text-red-600 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  className,
  ...rest
}: {
  variant?: Variant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANT_CLASSES[variant], className)}
      {...rest}
    />
  );
}

export function LinkButton({
  variant = "primary",
  className,
  href,
  ...rest
}: {
  variant?: Variant;
  className?: string;
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANT_CLASSES[variant], className)}
      {...rest}
    />
  );
}
