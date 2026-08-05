"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { AuditoriaService } from "../services/AuditoriaService";
import { LogFilters } from "../repositories/AuditoriaRepository";

export async function getAuditoriaLogsAction(filters: LogFilters = {}, limit: number = 100, offset: number = 0) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.tipoUsuario !== "ADMIN") {
    throw new Error("Acesso negado. Apenas administradores podem aceder aos logs de auditoria.");
  }
  return AuditoriaService.obterLogs(filters, limit, offset);
}
