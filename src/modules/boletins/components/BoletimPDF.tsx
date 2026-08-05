import React from "react";
import path from "path";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const logoPath = path.join(process.cwd(), "public", "logo.jpeg");

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
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
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    textTransform: "uppercase",
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoBlock: {
    flexDirection: "column",
  },
  infoText: {
    marginBottom: 3,
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
    height: 24,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  colSubject: {
    width: "40%",
    paddingLeft: 5,
  },
  colGrade: {
    width: "12%",
    textAlign: "center",
  },
  colStatus: {
    width: "24%",
    textAlign: "center",
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
    fontSize: 9,
    paddingTop: 5,
  },
});

interface BoletimPDFProps {
  data: {
    escola: {
      nome: string;
      endereco: string;
      diretor: string;
    };
    aluno: {
      nome: string;
      numeroBI: string;
      contacto: string;
    };
    turma: string;
    anoLetivo: string;
    trimestre: number;
    disciplinas: Array<{
      disciplina: string;
      acs1: any;
      acs2: any;
      acp: any;
      media: any;
      situacao: string;
    }>;
    dataEmissao: string;
  };
}

export const BoletimPDF: React.FC<BoletimPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header com Logo */}
      <View style={styles.header}>
        <Image style={styles.logo} src={logoPath} />
        <View style={styles.headerTextBlock}>
          <Text style={styles.schoolName}>{data.escola.nome}</Text>
          <Text style={styles.schoolSub}>{data.escola.endereco}</Text>
          <Text style={styles.title}>Boletim Escolar Oficial - {data.trimestre}º Trimestre</Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Aluno: </Text>
            {data.aluno.nome}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Nº BI: </Text>
            {data.aluno.numeroBI}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Contacto: </Text>
            {data.aluno.contacto}
          </Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Turma: </Text>
            {data.turma}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Ano Letivo: </Text>
            {data.anoLetivo}
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
          <Text style={styles.colSubject}>Disciplina</Text>
          <Text style={styles.colGrade}>ACS1</Text>
          <Text style={styles.colGrade}>ACS2</Text>
          <Text style={styles.colGrade}>ACP</Text>
          <Text style={styles.colGrade}>Média</Text>
          <Text style={styles.colStatus}>Situação</Text>
        </View>

        {/* Table Rows */}
        {data.disciplinas.map((d, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colSubject}>{d.disciplina}</Text>
            <Text style={styles.colGrade}>{d.acs1}</Text>
            <Text style={styles.colGrade}>{d.acs2}</Text>
            <Text style={styles.colGrade}>{d.acp}</Text>
            <Text style={styles.colGrade}>{d.media}</Text>
            <Text style={styles.colStatus}>{d.situacao}</Text>
          </View>
        ))}
      </View>

      {/* Footer / Signatures */}
      <View style={styles.footer}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.signatureLine}>O Diretor Geral</Text>
          <Text style={{ fontSize: 8, color: "#666", marginTop: 2 }}>({data.escola.diretor})</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.signatureLine}>O Diretor Pedagógico</Text>
        </View>
      </View>
    </Page>
  </Document>
);
