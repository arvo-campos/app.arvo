import { cn } from "@/lib/utils";

export function ContadorD0({
  dataInicio,
  status,
  tamanho = "normal",
}: {
  dataInicio: Date;
  status: string;
  tamanho?: "normal" | "grande";
}) {
  if (status !== "em_andamento") return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicio = new Date(dataInicio);
  inicio.setHours(0, 0, 0, 0);

  const dias = Math.round((inicio.getTime() - hoje.getTime()) / 86_400_000);

  const grande = tamanho === "grande";

  if (dias > 0) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-baseline whitespace-nowrap rounded-full bg-arvo-terracota text-arvo-bg",
          grande ? "px-4 py-2" : "px-2.5 py-1"
        )}
      >
        <span className={cn("font-display font-bold", grande ? "text-xl" : "text-[11px]")}>
          D-{dias}
        </span>
      </span>
    );
  }

  // dias === 0: hoje é o dia de abertura
  if (dias === 0) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-arvo-terracota font-semibold text-arvo-bg",
          grande ? "px-4 py-2 text-base" : "px-2.5 py-1 text-[11px]"
        )}
      >
        D-0 · Hoje é o dia da abertura
      </span>
    );
  }

  // já abriu, evento seguindo em campo
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline gap-1.5 whitespace-nowrap rounded-full bg-arvo-grafite/10 text-arvo-grafite",
        grande ? "px-4 py-2" : "px-2.5 py-1"
      )}
    >
      <span className={cn("font-display font-bold", grande ? "text-xl" : "text-[11px]")}>
        D+{Math.abs(dias)}
      </span>
      <span className={cn("font-normal opacity-70", grande ? "text-xs" : "text-[10px]")}>
        desde a abertura
      </span>
    </span>
  );
}
