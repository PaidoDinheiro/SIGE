import { prisma } from "@/src/lib/prisma";
import { AcaoAuditoria } from "@/src/generated/prisma/client";

export interface LogFilters {
  usuarioId?: number;
  acao?: AcaoAuditoria;
  entidade?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export class AuditoriaRepository {
  static async criarLog(data: {
    usuarioId?: number;
    acao: AcaoAuditoria;
    entidade: string;
    entidadeId?: number;
    dadosAnteriores?: any;
    dadosNovos?: any;
    ip?: string;
  }) {
    return prisma.auditoria.create({
      data: {
        usuarioId: data.usuarioId,
        acao: data.acao,
        entidade: data.entidade,
        entidadeId: data.entidadeId,
        dadosAnteriores: data.dadosAnteriores ?? undefined,
        dadosNovos: data.dadosNovos ?? undefined,
        ip: data.ip,
      },
    });
  }

  static async obterLogs(filters: LogFilters = {}, limit: number = 100, offset: number = 0) {
    const where: any = {};

    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.acao) where.acao = filters.acao;
    if (filters.entidade) where.entidade = { contains: filters.entidade };
    if (filters.dataInicio || filters.dataFim) {
      where.createdAt = {};
      if (filters.dataInicio) where.createdAt.gte = filters.dataInicio;
      if (filters.dataFim) where.createdAt.lte = filters.dataFim;
    }

    const [logs, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        include: {
          usuario: { select: { nome: true, tipoUsuario: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditoria.count({ where }),
    ]);

    return { logs, total };
  }
}
