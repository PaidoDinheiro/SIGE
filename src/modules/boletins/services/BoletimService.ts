import { prisma } from "@/src/lib/prisma";

export class BoletimService {
  static async getBoletimData(alunoId: number, trimestre: number, anoLetivo: string) {
    // 1. Obter a matricula ativa para o aluno neste ano letivo
    const matricula = await prisma.matricula.findFirst({
      where: {
        alunoId,
        anoLetivo,
        status: "ATIVA",
        deletedAt: null,
      },
      include: {
        aluno: {
          include: {
            usuario: true,
          },
        },
        turma: true,
      },
    });

    if (!matricula) {
      throw new Error("Matrícula ativa não encontrada para o aluno neste ano letivo.");
    }

    // 2. Obter todas as disciplinas da turma
    const turmaDisciplinas = await prisma.turmaDisciplina.findMany({
      where: {
        turmaId: matricula.turmaId,
        deletedAt: null,
      },
      include: {
        disciplina: true,
      },
    });

    // 3. Obter todas as notas lançadas para o aluno neste trimestre/ano letivo
    const notas = await prisma.nota.findMany({
      where: {
        alunoId,
        trimestre,
        anoLetivo,
      },
    });

    // 4. Obter as configurações da escola
    const escola = await prisma.configuracaoEscola.findFirst();

    // 5. Consolidar os dados das disciplinas com as notas
    const disciplinasComNotas = turmaDisciplinas.map((td) => {
      const nota = notas.find((n) => n.turmaDisciplinaId === td.id);
      return {
        disciplina: td.disciplina.nome,
        acs1: nota ? Number(nota.acs1) : "-",
        acs2: nota ? Number(nota.acs2) : "-",
        acp: nota ? Number(nota.acp) : "-",
        media: nota ? Number(nota.media) : "-",
        situacao: nota ? nota.situacao : "-",
      };
    });

    return {
      escola: {
        nome: escola?.nome || "Escola Da Catedral",
        endereco: escola?.endereco || "Beira, Moçambique",
        diretor: escola?.diretor || "Diretor Geral",
        logoUrl: escola?.logoUrl || "",
      },
      aluno: {
        nome: matricula.aluno.usuario.nome,
        numeroBI: matricula.aluno.numeroBI,
        contacto: matricula.aluno.contacto || "-",
      },
      turma: matricula.turma.nome,
      anoLetivo,
      trimestre,
      disciplinas: disciplinasComNotas,
      dataEmissao: new Date().toLocaleDateString("pt-MZ"),
    };
  }
}
