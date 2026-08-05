import { prisma } from "@/src/lib/prisma";
import { Prisma, TipoUsuario, Usuario } from "@/src/generated/prisma/client";

export class UserRepository {
  static async findUserByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  static async findUserById(id: number): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id },
    });
  }

  static async updateLastLogin(id: number): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id },
      data: {
        ultimoLogin: new Date(),
      },
    });
  }

  static async createUser(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return prisma.usuario.create({
      data,
    });
  }

  static async countAdminUsers(): Promise<number> {
    return prisma.usuario.count({
      where: {
        tipoUsuario: TipoUsuario.ADMIN,
        deletedAt: null,
      },
    });
  }
}
