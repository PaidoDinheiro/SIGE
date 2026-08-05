import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@/src/generated/prisma/client";

export class AlunoRepository {
  static async findMany(query: string = "") {
    return prisma.aluno.findMany({
      where: {
        deletedAt: null,
        OR: query ? [
          { numeroBI: { contains: query } },
          { nomeEncarregado: { contains: query } },
          { usuario: { nome: { contains: query } } },
          { usuario: { email: { contains: query } } },
        ] : undefined,
      },
      include: {
        usuario: true,
      },
      orderBy: {
        usuario: {
          nome: "asc"
        }
      }
    });
  }

  static async findById(id: number) {
    return prisma.aluno.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        usuario: true,
      }
    });
  }

  static async create(data: {
    nome: string;
    email: string;
    senhaHash: string;
    numeroBI: string;
    dataNascimento: Date;
    contacto?: string;
    nomeEncarregado: string;
    contactoEncarregado?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome: data.nome,
          email: data.email,
          senha: data.senhaHash,
          tipoUsuario: "ALUNO",
          ativo: true,
        }
      });

      const aluno = await tx.aluno.create({
        data: {
          usuarioId: usuario.id,
          numeroBI: data.numeroBI,
          dataNascimento: data.dataNascimento,
          contacto: data.contacto || null,
          nomeEncarregado: data.nomeEncarregado,
          contactoEncarregado: data.contactoEncarregado || null,
        },
        include: {
          usuario: true
        }
      });

      return aluno;
    });
  }

  static async update(id: number, data: {
    nome: string;
    email: string;
    senhaHash?: string;
    numeroBI: string;
    dataNascimento: Date;
    contacto?: string;
    nomeEncarregado: string;
    contactoEncarregado?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const alunoAtual = await tx.aluno.findUniqueOrThrow({ where: { id } });

      await tx.usuario.update({
        where: { id: alunoAtual.usuarioId },
        data: {
          nome: data.nome,
          email: data.email,
          ...(data.senhaHash && { senha: data.senhaHash })
        }
      });

      const aluno = await tx.aluno.update({
        where: { id },
        data: {
          numeroBI: data.numeroBI,
          dataNascimento: data.dataNascimento,
          contacto: data.contacto || null,
          nomeEncarregado: data.nomeEncarregado,
          contactoEncarregado: data.contactoEncarregado || null,
        },
        include: {
          usuario: true
        }
      });

      return aluno;
    });
  }

  static async softDelete(id: number) {
    return prisma.$transaction(async (tx) => {
      const alunoAtual = await tx.aluno.findUniqueOrThrow({ where: { id } });

      await tx.usuario.update({
        where: { id: alunoAtual.usuarioId },
        data: {
          deletedAt: new Date(),
          ativo: false
        }
      });

      return tx.aluno.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });
    });
  }
}
