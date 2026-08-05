import { prisma } from "@/src/lib/prisma";

export class ProfessorTurmaRepository {
  static async findMany(query: string = "") {
    return prisma.turmaDisciplina.findMany({
      where: {
        deletedAt: null,
        OR: query ? [
          { professor: { nome: { contains: query } } },
          { turma: { nome: { contains: query } } },
          { disciplina: { nome: { contains: query } } },
        ] : undefined,
      },
      include: {
        professor: true,
        turma: true,
        disciplina: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  static async findById(id: number) {
    return prisma.turmaDisciplina.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        professor: true,
        turma: true,
        disciplina: true
      }
    });
  }

  static async create(data: { turmaId: number; disciplinaId: number; professorId: number }) {
    return prisma.turmaDisciplina.create({
      data: {
        turmaId: data.turmaId,
        disciplinaId: data.disciplinaId,
        professorId: data.professorId,
      }
    });
  }

  static async update(id: number, data: { turmaId: number; disciplinaId: number; professorId: number }) {
    return prisma.turmaDisciplina.update({
      where: { id },
      data: {
        turmaId: data.turmaId,
        disciplinaId: data.disciplinaId,
        professorId: data.professorId,
      }
    });
  }

  static async softDelete(id: number) {
    return prisma.turmaDisciplina.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }
}
