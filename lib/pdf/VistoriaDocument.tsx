import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { ArvoMark } from "./ArvoMark";
import { PDF_COLORS, registerFonts } from "./fonts";
import { NIVEL_VISTORIA_PDF_COLOR } from "./statusColors";
import { ESTAGIO_CULTURA_LABEL, NIVEL_VISTORIA_LABEL } from "@/lib/constants";

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
  badge: {
    fontSize: 9,
    fontWeight: 600,
    color: PDF_COLORS.white,
    backgroundColor: PDF_COLORS.terracota,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  value: { fontSize: 10, lineHeight: 1.4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 6,
  },
  chipLabel: { fontSize: 9, color: PDF_COLORS.grafiteMuted, marginRight: 4 },
  chipValue: {
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.white,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  gridRow: { flexDirection: "row", marginTop: 2 },
  gridCol: { width: "50%" },
  label: { fontSize: 8, color: PDF_COLORS.grafiteFaint, marginBottom: 1 },
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

type VistoriaParaPdf = {
  id: string;
  data: Date;
  estagioCultura: string | null;
  nivelPragas: string | null;
  nivelDoencas: string | null;
  nivelPlantasDaninhas: string | null;
  nivelEstresseHidrico: string | null;
  condicoes: string | null;
  observacoes: string | null;
  solicitaIntervencao: boolean;
  intervencaoDescricao: string | null;
  sugestaoProduto: string | null;
  sugestaoDosagem: string | null;
  parcelasSugeridas: { id: string; nome: string }[];
  evento: { nome: string; cliente: { nome: string } };
  autor: { nome: string };
};

const CATEGORIAS_AVALIACAO = [
  { campo: "nivelPragas", label: "Pragas" },
  { campo: "nivelDoencas", label: "Doenças" },
  { campo: "nivelPlantasDaninhas", label: "Plantas daninhas" },
  { campo: "nivelEstresseHidrico", label: "Estresse hídrico" },
] as const;

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export function VistoriaDocument({ vistoria }: { vistoria: VistoriaParaPdf }) {
  const categoriasAvaliadas = CATEGORIAS_AVALIACAO.filter(
    ({ campo }) => vistoria[campo]
  );
  const temSugestaoManejo =
    vistoria.sugestaoProduto ||
    vistoria.sugestaoDosagem ||
    vistoria.parcelasSugeridas.length > 0;

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
          {vistoria.solicitaIntervencao && (
            <Text style={styles.badge}>Intervenção solicitada</Text>
          )}
        </View>

        <Text style={styles.title}>
          {vistoria.evento.cliente.nome} — {vistoria.evento.nome}
        </Text>
        <Text style={styles.subtitle}>
          Vistoria de {formatarData(vistoria.data)} · Registrada por {vistoria.autor.nome}
          {vistoria.estagioCultura &&
            ` · Estágio: ${ESTAGIO_CULTURA_LABEL[vistoria.estagioCultura]}`}
        </Text>

        {vistoria.solicitaIntervencao && vistoria.intervencaoDescricao && (
          <>
            <Text style={styles.sectionTitle}>Intervenção solicitada</Text>
            <Text style={styles.value}>{vistoria.intervencaoDescricao}</Text>
          </>
        )}

        {categoriasAvaliadas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Avaliação do campo</Text>
            <View style={styles.chipRow}>
              {categoriasAvaliadas.map(({ campo, label }) => {
                const nivel = vistoria[campo] as string;
                return (
                  <View key={campo} style={styles.chip}>
                    <Text style={styles.chipLabel}>{label}:</Text>
                    <Text
                      style={[
                        styles.chipValue,
                        { backgroundColor: NIVEL_VISTORIA_PDF_COLOR[nivel] },
                      ]}
                    >
                      {NIVEL_VISTORIA_LABEL[nivel]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {vistoria.condicoes && (
          <>
            <Text style={styles.sectionTitle}>Condições do campo</Text>
            <Text style={styles.value}>{vistoria.condicoes}</Text>
          </>
        )}

        {vistoria.observacoes && (
          <>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.value}>{vistoria.observacoes}</Text>
          </>
        )}

        {temSugestaoManejo && (
          <>
            <Text style={styles.sectionTitle}>Sugestão de manejo</Text>
            <View style={styles.gridRow}>
              {vistoria.sugestaoProduto && (
                <View style={styles.gridCol}>
                  <Text style={styles.label}>Produto</Text>
                  <Text style={styles.value}>{vistoria.sugestaoProduto}</Text>
                </View>
              )}
              {vistoria.sugestaoDosagem && (
                <View style={styles.gridCol}>
                  <Text style={styles.label}>Dosagem</Text>
                  <Text style={styles.value}>{vistoria.sugestaoDosagem}</Text>
                </View>
              )}
            </View>
            {vistoria.parcelasSugeridas.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.label}>Parcelas</Text>
                <Text style={styles.value}>
                  {vistoria.parcelasSugeridas.map((p) => p.nome).join(", ")}
                </Text>
              </View>
            )}
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
