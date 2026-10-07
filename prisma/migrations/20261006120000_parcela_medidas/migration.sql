-- Largura passa de texto livre ("4.5m") para número em metros.
-- Aproveita o primeiro número que aparecer no texto (aceitando vírgula);
-- o que não tiver número vira vazio.
ALTER TABLE "Parcela"
  ALTER COLUMN "largura" TYPE DOUBLE PRECISION
  USING (substring(replace("largura", ',', '.') from '[0-9]+(?:\.[0-9]+)?'))::double precision;

-- Novo campo: comprimento da parcela, em metros.
ALTER TABLE "Parcela" ADD COLUMN "comprimento" DOUBLE PRECISION;
