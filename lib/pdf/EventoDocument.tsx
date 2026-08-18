import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ArvoMark } from "./ArvoMark";
import { PDF_COLORS, registerFonts } from "./fonts";
import { STATUS_MANEJO_PDF_COLOR } from "./statusColors";
import {
  STATUS_MANEJO_LABEL,
  STATUS_EVENTO_LABEL,
  TIPO_MANEJO_LABEL,
} from "@/lib/constants";

registerFonts();

const styles = StyleSheet.create({
  cover: {
    backgroundColor: PDF_COLORS.grafite,
    padding: 48,
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  coverBrandRow: { flexDirection: "row", alignItems: "center" },
  coverBrandName: { fontSize: 16, fontWeight: 700, color: PDF_COLORS.bg, marginLeft: 8 },
  coverTagline: {
    fontSize: 8,
    color: PDF_COLORS.terracota,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 8,
    marginTop: 1,
  },
  coverMiddle: { marginTop: 100 },
  coverEyebrow: {
    fontSize: 10,
    color: PDF_COLORS.terracota,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  coverTitle: { fontSize: 30, fontWeight: 700, color: PDF_COLORS.bg, marginBottom: 12 },
  coverMeta: { fontSize: 11, color: PDF_COLORS.bg, opacity: 0.8, marginBottom: 4 },
  coverFooter: { fontSize: 8, color: PDF_COLORS.bg, opacity: 0.5 },

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
  brandName: { fontSize: 12, fontWeight: 700, marginLeft: 6 },
  headerLabel: {
    fontSize: 8,
    color: PDF_COLORS.grafiteMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 16,
    color: PDF_COLORS.terracota,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsRow: { flexDirection: "row", flexWrap: "wrap" },
  statBox: {
    width: "18%",
    marginRight: "2%",
    marginBottom: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
  },
  statValue: { fontSize: 18, fontWeight: 700 },
  statLabel: { fontSize: 7, color: PDF_COLORS.grafiteMuted, marginTop: 2, textTransform: "uppercase" },

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
  statusPill: {
    fontSize: 7,
    fontWeight: 600,
    color: PDF_COLORS.white,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  fotosGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  foto: {
    width: 105,
    height: 105,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
    objectFit: "cover",
  },

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

type EventoParaPdf = {
  id: string;
  nome: string;
  local: string;
  status: string;
  dataInicio: Date;
  dataFim: Date | null;
  cliente: { nome: string };
  manejos: {
    id: string;
    tipo: string;
    status: string;
    data: Date;
    fotos: { id: string; url: string }[];
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

export function EventoDocument({ evento }: { evento: EventoParaPdf }) {
  const totalManejos = evento.manejos.length;
  const aprovados = evento.manejos.filter((m) => m.status === "aprovado").length;
  const reprovados = evento.manejos.filter((m) => m.status === "reprovado").length;
  const pendentes = evento.manejos.filter((m) => m.status === "pendente").length;
  const concluidos = evento.manejos.filter((m) => m.status === "concluido").length;
  const avaliados = aprovados + reprovados;
  const taxaAprovacao = avaliados > 0 ? Math.round((aprovados / avaliados) * 100) : null;

  const fotos = evento.manejos.flatMap((m) => m.fotos).slice(0, 12);

  return (
    <Document>
      <Page size="A4" style={styles.cover}>
        <View style={styles.coverBrandRow}>
          <ArvoMark size={20} color={PDF_COLORS.terracota} />
          <View>
            <Text style={styles.coverBrandName}>Arvo</Text>
            <Text style={styles.coverTagline}>Caderno de Campo Digital</Text>
          </View>
        </View>

        <View style={styles.coverMiddle}>
          <Text style={styles.coverEyebrow}>Relatório executivo do evento</Text>
          <Text style={styles.coverTitle}>{evento.nome}</Text>
          <Text style={styles.coverMeta}>{evento.cliente.nome}</Text>
          <Text style={styles.coverMeta}>{evento.local}</Text>
          <Text style={styles.coverMeta}>
            {formatarData(evento.dataInicio)}
            {evento.dataFim ? ` – ${formatarData(evento.dataFim)}` : ""}
            {"  ·  "}
            {STATUS_EVENTO_LABEL[evento.status] ?? evento.status}
          </Text>
        </View>

        <Text style={styles.coverFooter}>
          Gerado em {formatarDataHora(new Date())}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <ArvoMark size={14} />
            <Text style={styles.brandName}>Arvo</Text>
          </View>
          <Text style={styles.headerLabel}>{evento.nome}</Text>
        </View>

        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalManejos}</Text>
            <Text style={styles.statLabel}>Manejos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: STATUS_MANEJO_PDF_COLOR.pendente }]}>
              {pendentes}
            </Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: STATUS_MANEJO_PDF_COLOR.aprovado }]}>
              {aprovados}
            </Text>
            <Text style={styles.statLabel}>Aprovados</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: STATUS_MANEJO_PDF_COLOR.reprovado }]}>
              {reprovados}
            </Text>
            <Text style={styles.statLabel}>Reprovados</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {taxaAprovacao !== null ? `${taxaAprovacao}%` : "—"}
            </Text>
            <Text style={styles.statLabel}>Taxa de aprovação</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Manejos ({totalManejos})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: "35%" }]}>Tipo</Text>
            <Text style={[styles.th, { width: "35%" }]}>Data</Text>
            <Text style={[styles.th, { width: "30%" }]}>Status</Text>
          </View>
          {evento.manejos.map((manejo) => (
            <View key={manejo.id} style={styles.tableRow}>
              <Text style={[styles.td, { width: "35%" }]}>
                {TIPO_MANEJO_LABEL[manejo.tipo] ?? manejo.tipo}
              </Text>
              <Text style={[styles.td, { width: "35%" }]}>{formatarData(manejo.data)}</Text>
              <View style={{ width: "30%", padding: 6 }}>
                <Text
                  style={[
                    styles.statusPill,
                    { backgroundColor: STATUS_MANEJO_PDF_COLOR[manejo.status] ?? PDF_COLORS.grafite },
                  ]}
                >
                  {STATUS_MANEJO_LABEL[manejo.status] ?? manejo.status}
                </Text>
              </View>
            </View>
          ))}
          {evento.manejos.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: "100%" }]}>
                Nenhum manejo registrado neste evento.
              </Text>
            </View>
          )}
        </View>

        {fotos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <View style={styles.fotosGrid}>
              {fotos.map((foto) => (
                <Image
                  key={foto.id}
                  style={styles.foto}
                  src={foto.url}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.footer} fixed>
          <Text>Arvo — Caderno de Campo Digital</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
