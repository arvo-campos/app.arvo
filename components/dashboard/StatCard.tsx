export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-arvo-grafite/60">{label}</p>
      <p
        className={
          accent
            ? "mt-2 font-display text-3xl font-bold text-arvo-terracota"
            : "mt-2 font-display text-3xl font-bold text-arvo-grafite"
        }
      >
        {value}
      </p>
    </div>
  );
}
