"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { RelatorioService } from "../services/RelatorioService";
import { MetodoPagamento } from "@/src/generated/prisma/client";

async function checkAuth(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Não autenticado.");
  if (!allowedRoles.includes(session.user.tipoUsuario!)) throw new Error("Acesso negado.");
  return session;
}

export async function getRelatorioArrecadacaoAction(filters: {
  dataInicio?: string;
  dataFim?: string;
  mesReferencia?: string;
  anoLetivo?: string;
  metodoPagamento?: string;
}) {
  await checkAuth(["ADMIN", "TESOURARIA"]);

  return RelatorioService.getRelatorioArrecadacao({
    dataInicio: filters.dataInicio ? new Date(filters.dataInicio) : undefined,
    dataFim: filters.dataFim ? new Date(filters.dataFim) : undefined,
    mesReferencia: filters.mesReferencia || undefined,
    anoLetivo: filters.anoLetivo || undefined,
    metodoPagamento: filters.metodoPagamento
      ? (filters.metodoPagamento as MetodoPagamento)
      : undefined,
  });
}

export async function getRelatorioInadimplenciaAction(anoLetivo: string) {
  await checkAuth(["ADMIN", "TESOURARIA"]);
  return RelatorioService.getRelatorioInadimplencia(anoLetivo);
}
