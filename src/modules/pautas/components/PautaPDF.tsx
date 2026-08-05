import React from "react";
import path from "path";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const logoPath = path.join(process.cwd(), "public", "logo.jpeg");

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#333",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a8a",
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 4,
  },
  headerTextBlock: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#1e3a8a",
  },
  schoolSub: {
    fontSize: 10,
    color: "#666",
    marginBottom: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    textTransform: "uppercase",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 4,
  },
  infoText: {
    marginBottom: 2,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    alignItems: "center",
    height: 22,
  },
  tableHeader: {
    backgroundColor: "#e5e7eb",
    fontWeight: "bold",
  },
  colNum: {
    width: "8%",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    height: "100%",
    justifyContent: "center",
    paddingTop: 5,
  },
  colNome: {
    width: "42%",
    paddingLeft: 5,
    borderRightWidth: 1,
    borderRightColor: "#000",
    height: "100%",
    justifyContent: "center",
    paddingTop: 5,
  },
  colGrade: {
    width: "10%",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    height: "100%",
    justifyContent: "center",
    paddingTop: 5,
  },
  colStatus: {
    width: "20%",
    textAlign: "center",
    height: "100%",
    justifyContent: "center",
    paddingTop: 5,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: 150,
    marginTop: 30,
    textAlign: "center",
    fontSize: 8,
    paddingTop: 5,
  },
});

interface PautaPDFProps {
  data: {
    escola: {
      nome: string;
      endereco: string;
      diretor: string;
    };
    turma: string;
    disciplina: string;
    professor: string;
    anoLetivo: string;
    trimestre: number;
    alunos: Array<{
      numero: number;
      nome: string;
      acs1: any;
      acs2: any;
      acp: any;
      media: any;
      situacao: string;
    }>;
    dataEmissao: string;
  };
}

export const PautaPDF: React.FC<PautaPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header com Logo */}
      <View style={styles.header}>
        <Image style={styles.logo} src={logoPath} />
        <View style={styles.headerTextBlock}>
          <Text style={styles.schoolName}>{data.escola.nome}</Text>
          <Text style={styles.schoolSub}>{data.escola.endereco}</Text>
          <Text style={styles.title}>Pauta Pedagógica Oficial de Aproveitamento</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={{ width: "50%" }}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Turma: </Text>
            {data.turma}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Disciplina: </Text>
            {data.disciplina}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Professor: </Text>
            {data.professor}
          </Text>
        </View>
        <View style={{ width: "50%", alignItems: "flex-end" }}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Ano Letivo: </Text>
            {data.anoLetivo}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Trimestre: </Text>
            {data.trimestre}º Trimestre
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Emissão: </Text>
            {data.dataEmissao}
          </Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.colNum}>Nº</Text>
          <Text style={styles.colNome}>Nome do Aluno</Text>
          <Text style={styles.colGrade}>ACS1</Text>
          <Text style={styles.colGrade}>ACS2</Text>
          <Text style={styles.colGrade}>ACP</Text>
          <Text style={styles.colGrade}>Média</Text>
          <Text style={styles.colStatus}>Situação</Text>
        </View>

        {/* Table Rows */}
        {data.alunos.map((aluno) => (
          <View key={aluno.numero} style={styles.tableRow}>
            <Text style={styles.colNum}>{aluno.numero}</Text>
            <Text style={styles.colNome}>{aluno.nome}</Text>
            <Text style={styles.colGrade}>{aluno.acs1}</Text>
            <Text style={styles.colGrade}>{aluno.acs2}</Text>
            <Text style={styles.colGrade}>{aluno.acp}</Text>
            <Text style={styles.colGrade}>{aluno.media}</Text>
            <Text style={styles.colStatus}>{aluno.situacao}</Text>
          </View>
        ))}
      </View>

      {/* Footer / Signatures */}
      <View style={styles.footer}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.signatureLine}>Professor da Disciplina</Text>
          <Text style={{ fontSize: 7, color: "#666", marginTop: 2 }}>({data.professor})</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.signatureLine}>Direção Pedagógica</Text>
        </View>
      </View>
    </Page>
  </Document>
);
