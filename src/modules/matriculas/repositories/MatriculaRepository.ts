import { prisma } from "@/src/lib/prisma";
import { StatusMatricula } from "@/src/generated/prisma/client";

export class MatriculaRepository {
  static async findMany(query: string = "") {
    return prisma.matricula.findMany({
      where: {
        deletedAt: null,
        OR: query ? [
          { aluno: { usuario: { nome: { contains: query } } } },
          { aluno: { numeroBI: { contains: query } } },
          { turma: { nome: { contains: query } } },
          { anoLetivo: { contains: query } },
        ] : undefined,
      },
      include: {
        aluno: {
          include: {
            usuario: true
          }
        },
        turma: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  static async findById(id: number) {
    return prisma.matricula.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        aluno: {
          include: {
            usuario: true
          }
        },
        turma: true
      }
    });
  }

  static async create(data: { alunoId: number; turmaId: number; anoLetivo: string; status: StatusMatricula }) {
    return prisma.matricula.create({
      data: {
        alunoId: data.alunoId,
        turmaId: data.turmaId,
        anoLetivo: data.anoLetivo,
        status: data.status,
      }
    });
  }

  static async update(id: number, data: { alunoId: number; turmaId: number; anoLetivo: string; status: StatusMatricula }) {
    return prisma.matricula.update({
      where: { id },
      data: {
        alunoId: data.alunoId,
        turmaId: data.turmaId,
        anoLetivo: data.anoLetivo,
        status: data.status,
      }
    });
  }

  static async softDelete(id: number) {
    return prisma.matricula.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }
}
