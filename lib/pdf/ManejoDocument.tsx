import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ArvoMark } from "./ArvoMark";
import { PDF_COLORS, registerFonts } from "./fonts";
import { STATUS_MANEJO_PDF_COLOR } from "./statusColors";
import {
  STATUS_MANEJO_LABEL,
  TIPO_MANEJO_LABEL,
} from "@/lib/constants";

registerFonts();

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Archivo",
    fontSize: 10,
    color: PDF_COLORS.grafite,
    backgroundColor: PDF_COLORS.white,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandName: { fontSize: 14, fontWeight: 700, marginLeft: 8 },
  tagline: {
    fontSize: 7,
    color: PDF_COLORS.terracota,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 8,
    marginTop: 1,
  },
  badge: {
    fontSize: 9,
    fontWeight: 600,
    color: PDF_COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  subtitle: {
    fontSize: 9,
    color: PDF_COLORS.grafiteMuted,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
    marginTop: 14,
    color: PDF_COLORS.terracota,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: { width: "33%", marginBottom: 8, paddingRight: 8 },
  label: {
    fontSize: 7,
    color: PDF_COLORS.grafiteFaint,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { fontSize: 10 },
  table: { marginTop: 4, borderWidth: 1, borderColor: PDF_COLORS.border },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: PDF_COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  th: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    padding: 6,
    color: PDF_COLORS.grafiteMuted,
  },
  td: { fontSize: 9, padding: 6 },
  fotosGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  foto: {
    width: 110,
    height: 110,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
    objectFit: "cover",
  },
  historicoRow: { flexDirection: "row", marginBottom: 8 },
  historicoDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3, marginRight: 6 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: PDF_COLORS.grafiteFaint,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
  },
});

type ManejoParaPdf = {
  id: string;
  tipo: string;
  responsavel: string | null;
  acompanhamento: string | null;
  data: Date;
  horaInicio: string | null;
  horaFim: string | null;
  tempInicio: number | null;
  tempFim: number | null;
  umidInicio: number | null;
  umidFim: number | null;
  ventoInicio: number | null;
  ventoFim: number | null;
  ultimaChuva: string | null;
  equipamento: string | null;
  qtdLinhas: number | null;
  espLinhas: number | null;
  profundidade: number | null;
  sementesPorMetro: string | null;
  tipoAplicacao: string | null;
  ponta: string | null;
  volumePonta: string | null;
  numPontas: number | null;
  espPontas: number | null;
  altBarra: number | null;
  pressao: number | null;
  volCalda: number | null;
  velocidade: number | null;
  anotacoes: string | null;
  status: string;
  evento: { nome: string; local: string; cliente: { nome: string } };
  produtos: {
    id: string;
    numTrat: number;
    nome: string;
    ingrediente: string;
    doseHa: string;
  }[];
  fotos: { id: string; url: string; legenda: string | null }[];
  historico: {
    id: string;
    acao: string;
    observacao: string | null;
    criadoEm: Date;
    usuario: { nome: string };
  }[];
};

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <View style={styles.gridItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
}

export function ManejoDocument({ manejo }: { manejo: ManejoParaPdf }) {
  const corStatus = STATUS_MANEJO_PDF_COLOR[manejo.status] ?? PDF_COLORS.grafite;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <ArvoMark size={18} />
            <View>
              <Text style={styles.brandName}>Arvo</Text>
              <Text style={styles.tagline}>Caderno de Campo Digital</Text>
            </View>
          </View>
          <Text style={[styles.badge, { backgroundColor: corStatus }]}>
            {STATUS_MANEJO_LABEL[manejo.status] ?? manejo.status}
          </Text>
        </View>

        <Text style={styles.title}>
          {manejo.evento.cliente.nome} — {manejo.evento.nome}
        </Text>
        <Text style={styles.subtitle}>
          {TIPO_MANEJO_LABEL[manejo.tipo] ?? manejo.tipo}
        </Text>

        <Text style={styles.sectionTitle}>Geral</Text>
        <View style={styles.grid}>
          <InfoItem label="Responsável" value={manejo.responsavel} />
          <InfoItem label="Acompanhamento" value={manejo.acompanhamento} />
          <InfoItem label="Data" value={formatarData(manejo.data)} />
          <InfoItem
            label="Horário"
            value={
              manejo.horaInicio && manejo.horaFim
                ? `${manejo.horaInicio} – ${manejo.horaFim}`
                : null
            }
          />
          <InfoItem label="Local do evento" value={manejo.evento.local} />
        </View>

        <Text style={styles.sectionTitle}>Clima</Text>
        <View style={styles.grid}>
          <InfoItem
            label="Temperatura"
            value={
              manejo.tempInicio != null
                ? `${manejo.tempInicio}°C – ${manejo.tempFim ?? "?"}°C`
                : null
            }
          />
          <InfoItem
            label="Umidade"
            value={
              manejo.umidInicio != null
                ? `${manejo.umidInicio}% – ${manejo.umidFim ?? "?"}%`
                : null
            }
          />
          <InfoItem
            label="Vento"
            value={
              manejo.ventoInicio != null
                ? `${manejo.ventoInicio} – ${manejo.ventoFim ?? "?"} km/h`
                : null
            }
          />
          <InfoItem label="Última chuva" value={manejo.ultimaChuva} />
        </View>

        <Text style={styles.sectionTitle}>Dados específicos</Text>
        <View style={styles.grid}>
          {manejo.tipo === "plantio" ? (
            <>
              <InfoItem label="Equipamento" value={manejo.equipamento} />
              <InfoItem label="Qtd. linhas" value={manejo.qtdLinhas} />
              <InfoItem
                label="Esp. linhas"
                value={manejo.espLinhas ? `${manejo.espLinhas} m` : null}
              />
              <InfoItem
                label="Profundidade"
                value={manejo.profundidade ? `${manejo.profundidade} cm` : null}
              />
              <InfoItem label="Sementes por metro" value={manejo.sementesPorMetro} />
            </>
          ) : manejo.tipo === "aplicacao" ? (
            <>
              <InfoItem label="Tipo de aplicação" value={manejo.tipoAplicacao} />
              <InfoItem label="Ponta" value={manejo.ponta} />
              <InfoItem label="Volume da ponta" value={manejo.volumePonta} />
              <InfoItem label="Nº de pontas" value={manejo.numPontas} />
              <InfoItem
                label="Esp. pontas"
                value={manejo.espPontas ? `${manejo.espPontas} m` : null}
              />
              <InfoItem
                label="Altura da barra"
                value={manejo.altBarra ? `${manejo.altBarra} m` : null}
              />
              <InfoItem label="Pressão" value={manejo.pressao ? `${manejo.pressao} bar` : null} />
              <InfoItem
                label="Volume de calda"
                value={manejo.volCalda ? `${manejo.volCalda} L/ha` : null}
              />
              <InfoItem
                label="Velocidade"
                value={manejo.velocidade ? `${manejo.velocidade} km/h` : null}
              />
            </>
          ) : (
            <InfoItem label="Equipamento / material" value={manejo.equipamento} />
          )}
        </View>

        {manejo.produtos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Produtos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, { width: "10%" }]}>Trat.</Text>
                <Text style={[styles.th, { width: "35%" }]}>Produto</Text>
                <Text style={[styles.th, { width: "35%" }]}>Ingrediente</Text>
                <Text style={[styles.th, { width: "20%" }]}>Dose/ha</Text>
              </View>
              {manejo.produtos.map((produto) => (
                <View key={produto.id} style={styles.tableRow}>
                  <Text style={[styles.td, { width: "10%" }]}>{produto.numTrat}</Text>
                  <Text style={[styles.td, { width: "35%" }]}>{produto.nome}</Text>
                  <Text style={[styles.td, { width: "35%" }]}>{produto.ingrediente}</Text>
                  <Text style={[styles.td, { width: "20%" }]}>{produto.doseHa}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {manejo.anotacoes && (
          <>
            <Text style={styles.sectionTitle}>Anotações</Text>
            <Text style={styles.value}>{manejo.anotacoes}</Text>
          </>
        )}

        {manejo.fotos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <View style={styles.fotosGrid}>
              {manejo.fotos.map((foto) => (
                <Image
                  key={foto.id}
                  style={styles.foto}
                  src={foto.url}
                />
              ))}
            </View>
          </>
        )}

        {manejo.historico.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Histórico de aprovação</Text>
            {manejo.historico.map((h) => (
              <View key={h.id} style={styles.historicoRow}>
                <View
                  style={[
                    styles.historicoDot,
                    {
                      backgroundColor:
                        h.acao === "aprovado" ? "#2563EB" : "#DC2626",
                    },
                  ]}
                />
                <View>
                  <Text style={styles.value}>
                    {h.usuario.nome} — {h.acao === "aprovado" ? "Aprovado" : "Reprovado"}{" "}
                    <Text style={{ color: PDF_COLORS.grafiteFaint }}>
                      em {formatarDataHora(h.criadoEm)}
                    </Text>
                  </Text>
                  {h.observacao && (
                    <Text style={[styles.value, { color: PDF_COLORS.grafiteMuted }]}>
                      {h.observacao}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} fixed>
          <Text>Arvo — Caderno de Campo Digital</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages} · Gerado em ${formatarDataHora(new Date())}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
