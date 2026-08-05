import { prisma } from "@/src/lib/prisma";

export class EncarregadoRepository {
  static async findMany(query: string = "") {
    return prisma.usuario.findMany({
      where: {
        tipoUsuario: "ENCARREGADO",
        deletedAt: null,
        OR: query ? [
          { nome: { contains: query } },
          { email: { contains: query } },
        ] : undefined,
      },
      orderBy: {
        nome: "asc"
      }
    });
  }

  static async findById(id: number) {
    return prisma.usuario.findFirst({
      where: {
        id,
        tipoUsuario: "ENCARREGADO",
        deletedAt: null,
      }
    });
  }

  static async create(data: {
    nome: string;
    email: string;
    senhaHash: string;
    ativo: boolean;
  }) {
    return prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senhaHash,
        tipoUsuario: "ENCARREGADO",
        ativo: data.ativo,
      }
    });
  }

  static async update(id: number, data: {
    nome: string;
    email: string;
    senhaHash?: string;
    ativo: boolean;
  }) {
    return prisma.usuario.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        ativo: data.ativo,
        ...(data.senhaHash && { senha: data.senhaHash })
      }
    });
  }

  static async softDelete(id: number) {
    return prisma.usuario.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        ativo: false
      }
    });
  }
}
