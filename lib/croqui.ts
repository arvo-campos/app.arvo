// Regras de organização do croqui em fileiras.
//
// No banco, cada parcela guarda `posY` (em qual fileira está) e `posX` (a
// ordem dela dentro da fileira). Aqui trabalhamos com uma representação mais
// fácil de manipular: uma lista de fileiras, cada uma com a lista de ids em
// ordem. Essas funções são puras (não acessam banco nem tela), então rodam
// igual no servidor e no navegador — e dá pra testar sem montar nada.

type ComPosicao = { id: string; posX: number; posY: number };

/** Agrupa as parcelas em fileiras, na ordem de cima pra baixo e da esquerda pra direita. */
export function agruparEmFileiras(parcelas: ComPosicao[]): string[][] {
  const ordenadas = [...parcelas].sort((a, b) => a.posY - b.posY || a.posX - b.posX);
  const fileiras: string[][] = [];
  let posYAtual: number | null = null;
  for (const parcela of ordenadas) {
    if (parcela.posY !== posYAtual) {
      fileiras.push([]);
      posYAtual = parcela.posY;
    }
    fileiras[fileiras.length - 1].push(parcela.id);
  }
  return fileiras;
}

/**
 * Move uma parcela pra `fileiraDestino`, na posição `indiceDestino`.
 * `fileiraDestino` igual ao total de fileiras cria uma fileira nova no fim.
 * Fileiras que ficam vazias são removidas.
 */
export function moverNaGrade(
  fileiras: string[][],
  id: string,
  fileiraDestino: number,
  indiceDestino: number
): string[][] {
  if (fileiraDestino < 0 || fileiraDestino > fileiras.length) return fileiras;
  if (!fileiras.some((f) => f.includes(id))) return fileiras;

  const novas = fileiras.map((f) => f.filter((parcelaId) => parcelaId !== id));
  if (fileiraDestino === novas.length) novas.push([]);
  const destino = novas[fileiraDestino];
  const indice = Math.max(0, Math.min(indiceDestino, destino.length));
  destino.splice(indice, 0, id);
  return novas.filter((f) => f.length > 0);
}

/** Remove uma parcela da grade, fechando o buraco que ela deixou. */
export function removerDaGrade(fileiras: string[][], id: string): string[][] {
  return fileiras
    .map((f) => f.filter((parcelaId) => parcelaId !== id))
    .filter((f) => f.length > 0);
}

/** Converte as fileiras de volta pra posições (posX/posY) consecutivas. */
export function posicoesDaGrade(
  fileiras: string[][]
): Map<string, { posX: number; posY: number }> {
  const posicoes = new Map<string, { posX: number; posY: number }>();
  fileiras.forEach((fileira, posY) =>
    fileira.forEach((id, posX) => posicoes.set(id, { posX, posY }))
  );
  return posicoes;
}

/** Formata as medidas pra exibição, ex: "4,5 × 10 m". */
export function formatarMedidas(
  largura: number | null,
  comprimento: number | null
): string | null {
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  if (largura != null && comprimento != null) return `${fmt(largura)} × ${fmt(comprimento)} m`;
  if (largura != null) return `${fmt(largura)} m de largura`;
  if (comprimento != null) return `${fmt(comprimento)} m de comprimento`;
  return null;
}
