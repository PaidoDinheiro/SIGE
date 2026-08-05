import { prisma } from "@/src/lib/prisma";
import { TipoFalta } from "@/src/generated/prisma/client";

export class FaltaRepository {
  static async findMany(query: string = "") {
    return prisma.falta.findMany({
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
      orderBy: { data: "desc" }
    });
  }

  static async findById(id: number) {
    return prisma.falta.findFirst({
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
    data: Date; 
    tipo: TipoFalta; 
    observacao?: string 
  }) {
    return prisma.falta.create({
      data: {
        alunoId: data.alunoId,
        matriculaId: data.matriculaId,
        turmaDisciplinaId: data.turmaDisciplinaId,
        disciplinaId: data.disciplinaId,
        data: data.data,
        tipo: data.tipo,
        observacao: data.observacao,
      }
    });
  }

  static async update(id: number, data: { 
    data: Date; 
    tipo: TipoFalta; 
    observacao?: string 
  }) {
    return prisma.falta.update({
      where: { id },
      data: {
        data: data.data,
        tipo: data.tipo,
        observacao: data.observacao,
      }
    });
  }

  static async delete(id: number) {
    return prisma.falta.delete({
      where: { id }
    });
  }
}
