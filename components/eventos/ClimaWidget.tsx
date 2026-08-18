import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";
import type { ClimaAtual } from "@/lib/weather";

export function ClimaWidget({
  clima,
  local,
  eventos,
}: {
  clima: ClimaAtual | null;
  local?: string;
  eventos?: string[];
}) {
  if (!clima) {
    return (
      <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-arvo-grafite">Clima</h2>
        <p className="mt-2 text-sm text-arvo-grafite/50">
          Sem coordenadas cadastradas para esse evento.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-arvo-grafite">
        Clima {local ? `— ${local}` : ""}
      </h2>
      {eventos && eventos.length > 0 && (
        <p className="mt-0.5 text-xs text-arvo-grafite/50">
          {eventos.length > 1 ? "Cobre: " : ""}
          {eventos.join(" · ")}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-arvo-terracota" />
          <div>
            <p className="text-sm font-semibold text-arvo-grafite">
              {clima.temperatura}°C
            </p>
            <p className="text-[11px] text-arvo-grafite/50">Temperatura</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-arvo-terracota" />
          <div>
            <p className="text-sm font-semibold text-arvo-grafite">
              {clima.umidade}%
            </p>
            <p className="text-[11px] text-arvo-grafite/50">Umidade</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-arvo-terracota" />
          <div>
            <p className="text-sm font-semibold text-arvo-grafite">
              {clima.vento} km/h
            </p>
            <p className="text-[11px] text-arvo-grafite/50">Vento</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CloudRain className="h-4 w-4 text-arvo-terracota" />
          <div>
            <p className="text-sm font-semibold text-arvo-grafite">
              {clima.chuvaSemana} mm
            </p>
            <p className="text-[11px] text-arvo-grafite/50">
              Chuva na semana · {clima.chuvaMes} mm no mês
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
