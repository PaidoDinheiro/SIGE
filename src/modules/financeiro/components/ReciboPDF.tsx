import React from "react";
import path from "path";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const logoPath = path.join(process.cwd(), "public", "logo.jpeg");

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
  headerStripe: {
    backgroundColor: "#1e3a8a",
    height: 6,
    marginBottom: 20,
    borderRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  logo: {
    width: 55,
    height: 55,
    marginRight: 10,
    borderRadius: 4,
  },
  schoolBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  schoolTextBlock: {
    flexDirection: "column",
  },
  schoolName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 3,
  },
  schoolSub: {
    fontSize: 9,
    color: "#666",
  },
  reciboBlock: {
    alignItems: "flex-end",
  },
  reciboTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  reciboNum: {
    fontSize: 11,
    color: "#444",
    marginTop: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    marginBottom: 8,
  },
  gridItemFull: {
    width: "100%",
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#111",
    fontWeight: "bold",
  },
  amountBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  amountLabel: {
    fontSize: 11,
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  amountValue: {
    fontSize: 20,
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: 160,
    marginTop: 30,
    textAlign: "center",
    fontSize: 9,
    paddingTop: 5,
    color: "#555",
  },
  watermark: {
    fontSize: 8,
    color: "#aaa",
    textAlign: "center",
    marginTop: 30,
  },
  stamp: {
    backgroundColor: "#dcfce7",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  stampText: {
    color: "#15803d",
    fontWeight: "bold",
    fontSize: 10,
  },
});

interface ReciboPDFProps {
  data: {
    escola: { nome: string; endereco: string; diretor: string };
    recibo: { numero: string; emitidoEm: string };
    aluno: { nome: string; numeroBI: string };
    pagamento: {
      mesReferencia: string;
      anoLetivo: string;
      valor: number;
      metodoPagamento: string;
      referenciaPagamento?: string | null;
      dataPagamento: string;
      observacao?: string | null;
    };
    operador: string;
  };
}

const metodoLabel: Record<string, string> = {
  CAIXA: "Pagamento em Caixa",
  TRANSFERENCIA: "Transferência Bancária",
  DEPOSITO: "Depósito Bancário",
};

export const ReciboPDF: React.FC<ReciboPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerStripe} />

      {/* Header com Logo */}
      <View style={styles.header}>
        <View style={styles.schoolBlock}>
          <Image style={styles.logo} src={logoPath} />
          <View style={styles.schoolTextBlock}>
            <Text style={styles.schoolName}>{data.escola.nome}</Text>
            <Text style={styles.schoolSub}>{data.escola.endereco}</Text>
          </View>
        </View>
        <View style={styles.reciboBlock}>
          <Text style={styles.reciboTitle}>RECIBO</Text>
          <Text style={styles.reciboNum}>{data.recibo.numero}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Dados do aluno */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Aluno</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Nome Completo</Text>
            <Text style={styles.value}>{data.aluno.nome}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Número de BI</Text>
            <Text style={styles.value}>{data.aluno.numeroBI}</Text>
          </View>
        </View>
      </View>

      {/* Dados do pagamento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes do Pagamento</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Mês de Referência</Text>
            <Text style={styles.value}>{data.pagamento.mesReferencia}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Ano Letivo</Text>
            <Text style={styles.value}>{data.pagamento.anoLetivo}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Método de Pagamento</Text>
            <Text style={styles.value}>{metodoLabel[data.pagamento.metodoPagamento] || data.pagamento.metodoPagamento}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Data do Pagamento</Text>
            <Text style={styles.value}>{data.pagamento.dataPagamento}</Text>
          </View>
          {data.pagamento.referenciaPagamento && (
            <View style={styles.gridItemFull}>
              <Text style={styles.label}>Referência de Transação</Text>
              <Text style={styles.value}>{data.pagamento.referenciaPagamento}</Text>
            </View>
          )}
          {data.pagamento.observacao && (
            <View style={styles.gridItemFull}>
              <Text style={styles.label}>Observações</Text>
              <Text style={styles.value}>{data.pagamento.observacao}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Valor total */}
      <View style={styles.amountBox}>
        <View>
          <Text style={styles.amountLabel}>Propina Mensal</Text>
          <View style={styles.stamp}>
            <Text style={styles.stampText}>✓ PAGO</Text>
          </View>
        </View>
        <Text style={styles.amountValue}>{Number(data.pagamento.valor).toFixed(2)} MT</Text>
      </View>

      {/* Emissão */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emissão</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Data de Emissão</Text>
            <Text style={styles.value}>{data.recibo.emitidoEm}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Operador</Text>
            <Text style={styles.value}>{data.operador}</Text>
          </View>
        </View>
      </View>

      {/* Rodapé / assinaturas */}
      <View style={styles.footer}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.sigLine}>O Tesoureiro(a)</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.sigLine}>O Encarregado de Educação</Text>
        </View>
      </View>

      <Text style={styles.watermark}>
        Documento emitido electronicamente pelo SIGE — {data.escola.nome} — {data.recibo.numero}
      </Text>
    </Page>
  </Document>
);
