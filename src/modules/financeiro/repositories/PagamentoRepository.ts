import { prisma } from "@/src/lib/prisma";
import { MetodoPagamento, StatusPagamento } from "@/src/generated/prisma/client";

export class PagamentoRepository {
  static async findMany(filters: {
    alunoId?: number;
    anoLetivo?: string;
    mesReferencia?: string;
    dataInicio?: Date;
    dataFim?: Date;
    metodoPagamento?: MetodoPagamento;
    query?: string;
  } = {}) {
    const where: any = {
      deletedAt: null,
    };

    if (filters.alunoId) {
      where.alunoId = filters.alunoId;
    }
    if (filters.anoLetivo) {
      where.anoLetivo = filters.anoLetivo;
    }
    if (filters.mesReferencia) {
      where.mesReferencia = filters.mesReferencia;
    }
    if (filters.metodoPagamento) {
      where.metodoPagamento = filters.metodoPagamento;
    }
    if (filters.dataInicio || filters.dataFim) {
      where.dataPagamento = {};
      if (filters.dataInicio) {
        where.dataPagamento.gte = filters.dataInicio;
      }
      if (filters.dataFim) {
        where.dataPagamento.lte = filters.dataFim;
      }
    }
    if (filters.query) {
      where.aluno = {
        usuario: {
          nome: { contains: filters.query },
        },
      };
    }

    return prisma.pagamento.findMany({
      where,
      include: {
        aluno: { include: { usuario: true } },
        responsavel: true,
        recibo: true,
      },
      orderBy: {
        dataPagamento: "desc",
      },
    });
  }

  static async findById(id: number) {
    return prisma.pagamento.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        aluno: { include: { usuario: true } },
        responsavel: true,
        recibo: true,
      },
    });
  }

  static async findActivePaymentByMonth(alunoId: number, mesReferencia: string) {
    return prisma.pagamento.findFirst({
      where: {
        alunoId,
        mesReferencia,
        deletedAt: null,
      },
    });
  }

  static async softDelete(id: number) {
    return prisma.pagamento.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "CANCELADO",
      },
    });
  }
}
