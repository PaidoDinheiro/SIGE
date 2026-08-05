"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { DashboardService } from "../services/DashboardService";

export async function getDashboardMetricsAction() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Não autenticado.");

  const role = session.user.tipoUsuario;
  
  switch (role) {
    case "ADMIN":
      return DashboardService.getAdminMetrics();
    case "PROFESSOR":
      return DashboardService.getProfessorMetrics(session.user.id);
    case "ALUNO":
      return DashboardService.getAlunoMetrics(session.user.id);
    case "TESOURARIA":
      return DashboardService.getTesourariaMetrics();
    case "SECRETARIA":
      return DashboardService.getSecretariaMetrics();
    case "ENCARREGADO":
      // Por agora retorna fallback
      return { kpis: {}, charts: {}, anoLetivo: "" };
    default:
      throw new Error("Perfil inválido.");
  }
}
