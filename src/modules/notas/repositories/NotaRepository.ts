import { prisma } from "@/src/lib/prisma";
import { SituacaoNota } from "@/src/generated/prisma/client";

export class NotaRepository {
  static async findMany(query: string = "") {
    return prisma.nota.findMany({
      where: query ? {
        OR: [
          { aluno: { usuario: { nome: { contains: query } } } },
          { disciplina: { nome: { contains: query } } },
        ]
      } : undefined,
      include: {
        aluno: { include: { usuario: true } },
        disciplina: true,
        turmaDisciplina: { include: { turma: true, professor: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findById(id: number) {
    return prisma.nota.findFirst({
      where: { id },
      include: {
        aluno: { include: { usuario: true } },
        disciplina: true,
        turmaDisciplina: { include: { turma: true, professor: true } }
      }
    });
  }

  static async create(data: { 
    alunoId: number; 
    matriculaId: number; 
    turmaDisciplinaId: number; 
    disciplinaId: number;
    trimestre: number; 
    anoLetivo: string; 
    acs1: number; 
    acs2: number; 
    acp: number; 
    media: number; 
    situacao: SituacaoNota 
  }) {
    return prisma.nota.create({
      data: {
        alunoId: data.alunoId,
        matriculaId: data.matriculaId,
        turmaDisciplinaId: data.turmaDisciplinaId,
        disciplinaId: data.disciplinaId,
        trimestre: data.trimestre,
        anoLetivo: data.anoLetivo,
        acs1: data.acs1,
        acs2: data.acs2,
        acp: data.acp,
        media: data.media,
        situacao: data.situacao,
      }
    });
  }

  static async update(id: number, data: { 
    acs1: number; 
    acs2: number; 
    acp: number; 
    media: number; 
    situacao: SituacaoNota 
  }) {
    return prisma.nota.update({
      where: { id },
      data: {
        acs1: data.acs1,
        acs2: data.acs2,
        acp: data.acp,
        media: data.media,
        situacao: data.situacao,
      }
    });
  }
}
