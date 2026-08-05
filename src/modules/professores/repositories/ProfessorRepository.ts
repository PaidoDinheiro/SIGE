import { prisma } from "@/src/lib/prisma";

export class ProfessorRepository {
  static async findMany(query: string = "") {
    return prisma.usuario.findMany({
      where: {
        tipoUsuario: "PROFESSOR",
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
        tipoUsuario: "PROFESSOR",
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
        tipoUsuario: "PROFESSOR",
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
