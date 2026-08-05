import { AuditoriaRepository, LogFilters } from "../repositories/AuditoriaRepository";
import { AcaoAuditoria } from "@/src/generated/prisma/client";

export class AuditoriaService {
  static async registarOperacao(
    acao: AcaoAuditoria,
    entidade: string,
    entidadeId?: number,
    dadosAnteriores?: any,
    dadosNovos?: any,
    usuarioId?: number,
    ip?: string
  ) {
    try {
      await AuditoriaRepository.criarLog({
        acao,
        entidade,
        entidadeId,
        dadosAnteriores,
        dadosNovos,
        usuarioId,
        ip,
      });
    } catch (error) {
      // Falhas na auditoria não devem quebrar o fluxo principal
      console.error("Falha ao registar log de auditoria:", error);
    }
  }

  static async obterLogs(filters: LogFilters = {}, limit: number = 100, offset: number = 0) {
    return AuditoriaRepository.obterLogs(filters, limit, offset);
  }
}
