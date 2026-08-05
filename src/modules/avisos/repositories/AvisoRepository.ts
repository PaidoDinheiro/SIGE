import { prisma } from "@/src/lib/prisma";

export class AvisoRepository {
  static async findMany(includeDeleted = false) {
    return prisma.aviso.findMany({
      where: includeDeleted ? undefined : { deletedAt: null },
      include: {
        autor: { select: { nome: true, tipoUsuario: true } },
      },
      orderBy: { publicadoEm: "desc" },
    });
  }

  static async findById(id: number) {
    return prisma.aviso.findUnique({
      where: { id },
      include: { autor: { select: { nome: true, tipoUsuario: true } } },
    });
  }

  static async create(data: { titulo: string; conteudo: string; autorId: number }) {
    return prisma.aviso.create({
      data,
    });
  }

  static async update(id: number, data: { titulo: string; conteudo: string }) {
    return prisma.aviso.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id: number) {
    return prisma.aviso.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async countActive() {
    return prisma.aviso.count({
      where: { deletedAt: null },
    });
  }
}
