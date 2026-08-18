import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  paginaAtual,
  totalPaginas,
  hrefFor,
}: {
  paginaAtual: number;
  totalPaginas: number;
  hrefFor: (pagina: number) => string;
}) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-4 text-sm">
      <Link
        href={hrefFor(Math.max(1, paginaAtual - 1))}
        className={cn(
          "font-medium text-arvo-terracota hover:underline",
          paginaAtual === 1 && "pointer-events-none opacity-30"
        )}
      >
        Anterior
      </Link>
      <span className="text-arvo-grafite/60">
        Página {paginaAtual} de {totalPaginas}
      </span>
      <Link
        href={hrefFor(Math.min(totalPaginas, paginaAtual + 1))}
        className={cn(
          "font-medium text-arvo-terracota hover:underline",
          paginaAtual === totalPaginas && "pointer-events-none opacity-30"
        )}
      >
        Próxima
      </Link>
    </div>
  );
}
