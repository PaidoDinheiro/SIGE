import { prisma } from "@/src/lib/prisma";

export class PautaService {
  static async getPautaData(turmaId: number, disciplinaId: number, trimestre: number, anoLetivo: string) {
    // 1. Obter a turma
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId, deletedAt: null },
    });
    if (!turma) throw new Error("Turma não encontrada.");

    // 2. Obter a disciplina
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: disciplinaId, deletedAt: null },
    });
    if (!disciplina) throw new Error("Disciplina não encontrada.");

    // 3. Obter a associação TurmaDisciplina correspondente
    const turmaDisciplina = await prisma.turmaDisciplina.findFirst({
      where: {
        turmaId,
        disciplinaId,
        deletedAt: null,
      },
      include: {
        professor: true,
      }
    });
    if (!turmaDisciplina) {
      throw new Error("Esta disciplina não está alocada a esta turma.");
    }

    // 4. Obter todos os alunos matriculados nesta turma
    const matriculas = await prisma.matricula.findMany({
      where: {
        turmaId,
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
      },
      orderBy: {
        aluno: {
          usuario: {
            nome: "asc",
          },
        },
      },
    });

    // 5. Obter todas as notas dos alunos nesta turma e disciplina
    const notas = await prisma.nota.findMany({
      where: {
        turmaDisciplinaId: turmaDisciplina.id,
        trimestre,
        anoLetivo,
      },
    });

    // 6. Configurações da escola
    const escola = await prisma.configuracaoEscola.findFirst();

    // 7. Consolidar os dados da pauta
    const alunosComNotas = matriculas.map((m, index) => {
      const nota = notas.find((n) => n.alunoId === m.alunoId);
      return {
        numero: index + 1,
        nome: m.aluno.usuario.nome,
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
      },
      turma: turma.nome,
      disciplina: disciplina.nome,
      professor: turmaDisciplina.professor.nome,
      anoLetivo,
      trimestre,
      alunos: alunosComNotas,
      dataEmissao: new Date().toLocaleDateString("pt-MZ"),
    };
  }
}
