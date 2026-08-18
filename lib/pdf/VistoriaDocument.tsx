import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ArvoMark } from "./ArvoMark";
import { PDF_COLORS, registerFonts } from "./fonts";

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
  fotosGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  fotoWrap: { width: 110, marginRight: 8, marginBottom: 10 },
  foto: {
    width: 110,
    height: 110,
    borderRadius: 4,
    objectFit: "cover",
  },
  fotoLegenda: { fontSize: 7, color: PDF_COLORS.grafiteMuted, marginTop: 2 },
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
  condicoes: string | null;
  observacoes: string | null;
  solicitaIntervencao: boolean;
  intervencaoDescricao: string | null;
  evento: { nome: string; cliente: { nome: string } };
  autor: { nome: string };
  fotos: {
    id: string;
    url: string;
    legenda: string | null;
    parcela: { nome: string } | null;
  }[];
};

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export function VistoriaDocument({ vistoria }: { vistoria: VistoriaParaPdf }) {
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
        </Text>

        {vistoria.solicitaIntervencao && vistoria.intervencaoDescricao && (
          <>
            <Text style={styles.sectionTitle}>Intervenção solicitada</Text>
            <Text style={styles.value}>{vistoria.intervencaoDescricao}</Text>
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

        {vistoria.fotos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <View style={styles.fotosGrid}>
              {vistoria.fotos.map((foto) => (
                <View key={foto.id} style={styles.fotoWrap}>
                  <Image
                    style={styles.foto}
                    src={foto.url}
                  />
                  {(foto.parcela || foto.legenda) && (
                    <Text style={styles.fotoLegenda}>
                      {[foto.parcela?.nome, foto.legenda].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </View>
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
