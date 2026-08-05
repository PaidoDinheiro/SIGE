import { prisma } from "@/src/lib/prisma";

export class TurmaRepository {
  static async findMany(query: string = "") {
    return prisma.turma.findMany({
      where: {
        deletedAt: null,
        OR: query ? [
          { nome: { contains: query } },
          { anoLetivo: { contains: query } },
        ] : undefined,
      },
      orderBy: {
        nome: "asc"
      }
    });
  }

  static async findById(id: number) {
    return prisma.turma.findFirst({
      where: {
        id,
        deletedAt: null,
      }
    });
  }

  static async create(data: { nome: string; anoLetivo: string }) {
    return prisma.turma.create({
      data: {
        nome: data.nome,
        anoLetivo: data.anoLetivo,
      }
    });
  }

  static async update(id: number, data: { nome: string; anoLetivo: string }) {
    return prisma.turma.update({
      where: { id },
      data: {
        nome: data.nome,
        anoLetivo: data.anoLetivo,
      }
    });
  }

  static async softDelete(id: number) {
    return prisma.turma.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }
}
