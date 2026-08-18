import "server-only";

export type ClimaAtual = {
  temperatura: number;
  umidade: number;
  vento: number;
  precipitacaoAtual: number;
  chuvaSemana: number;
  chuvaMes: number;
};

export async function buscarClima(
  latitude: string | null,
  longitude: string | null
): Promise<ClimaAtual | null> {
  if (!latitude || !longitude) return null;
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m"
  );
  url.searchParams.set("daily", "precipitation_sum");
  url.searchParams.set("past_days", "30");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  try {
    const resposta = await fetch(url, { next: { revalidate: 1800 } });
    if (!resposta.ok) return null;

    const json = await resposta.json();
    const precipitacaoDiaria: number[] = json?.daily?.precipitation_sum ?? [];

    const somar = (dias: number) =>
      precipitacaoDiaria
        .slice(-dias)
        .reduce((total: number, valor: number) => total + (valor ?? 0), 0);

    return {
      temperatura: json.current.temperature_2m,
      umidade: json.current.relative_humidity_2m,
      vento: json.current.wind_speed_10m,
      precipitacaoAtual: json.current.precipitation,
      chuvaSemana: Math.round(somar(7) * 10) / 10,
      chuvaMes: Math.round(somar(30) * 10) / 10,
    };
  } catch {
    return null;
  }
}
