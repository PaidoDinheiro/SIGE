import { prisma } from "@/src/lib/prisma";

export class DisciplinaRepository {
  static async findMany(query: string = "") {
    return prisma.disciplina.findMany({
      where: {
        deletedAt: null,
        OR: query ? [
          { nome: { contains: query } },
        ] : undefined,
      },
      orderBy: {
        nome: "asc"
      }
    });
  }

  static async findById(id: number) {
    return prisma.disciplina.findFirst({
      where: {
        id,
        deletedAt: null,
      }
    });
  }

  static async create(data: { nome: string }) {
    return prisma.disciplina.create({
      data: {
        nome: data.nome,
      }
    });
  }

  static async update(id: number, data: { nome: string }) {
    return prisma.disciplina.update({
      where: { id },
      data: {
        nome: data.nome,
      }
    });
  }

  static async softDelete(id: number) {
    return prisma.disciplina.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }
}
