export const STATUS_MANEJO_LABEL: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Retrabalho solicitado",
  concluido: "Concluído",
};

export const STATUS_MANEJO_CLASSES: Record<string, string> = {
  pendente: "bg-arvo-terracota/15 text-arvo-terracota",
  aprovado: "bg-blue-100 text-blue-700",
  reprovado: "bg-red-100 text-red-700",
  concluido: "bg-arvo-grafite/10 text-arvo-grafite/70",
};

export const STATUS_EVENTO_LABEL: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export const STATUS_EVENTO_CLASSES: Record<string, string> = {
  em_andamento: "bg-blue-100 text-blue-700",
  concluido: "bg-arvo-grafite/10 text-arvo-grafite/70",
};

export const TIPO_MANEJO_LABEL: Record<string, string> = {
  plantio: "Plantio",
  aplicacao: "Aplicação",
  montagem: "Montagem",
  organizacao: "Organização",
};

export const TIPO_MANEJO_DESCRICAO: Record<string, string> = {
  montagem: "Irrigação, cerca e outras montagens",
  organizacao: "Desfolha, abertura de ruas, placas, estacas e outras atividades",
};

export const ESTAGIO_CULTURA_LABEL: Record<string, string> = {
  emergencia: "Emergência",
  vegetativo: "Vegetativo",
  floracao: "Floração",
  enchimento_graos: "Enchimento de grãos",
  maturacao: "Maturação",
  colhido: "Colhido",
};

export const NIVEL_VISTORIA_LABEL: Record<string, string> = {
  nao_observado: "Não observado",
  leve: "Leve",
  moderado: "Moderado",
  severo: "Severo",
};

export const NIVEL_VISTORIA_CLASSES: Record<string, string> = {
  nao_observado: "bg-arvo-grafite/10 text-arvo-grafite/70",
  leve: "bg-blue-100 text-blue-700",
  moderado: "bg-arvo-terracota/15 text-arvo-terracota",
  severo: "bg-red-100 text-red-700",
};

// Limite de fotos por envio de manejo — evita passar do limite de tamanho
// do formulário quando várias fotos de celular, perto do máximo de 8MB
// cada, são enviadas de uma vez.
export const MAX_ARQUIVOS_FOTO = 10;

export const PRESETS_APLICACAO: Record<
  string,
  { ponta?: string; volumePonta?: string; pressao?: number; volCalda?: number }
> = {
  CO2: { ponta: "Leque 110", volumePonta: "02", pressao: 2.8, volCalda: 120 },
  Costal: { ponta: "Cone", volumePonta: "01", pressao: 3.5, volCalda: 200 },
  Autopropelida: {
    ponta: "Leque duplo 110",
    volumePonta: "03",
    pressao: 3.0,
    volCalda: 100,
  },
};
