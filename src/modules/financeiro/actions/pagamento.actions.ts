"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { PagamentoService } from "../services/PagamentoService";
import { PagamentoSchema } from "../schemas/PagamentoSchema";
import { prisma } from "@/src/lib/prisma";

async function checkAuth(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Não autenticado.");
  if (!allowedRoles.includes(session.user.tipoUsuario!)) throw new Error("Acesso negado.");
  return session;
}

export async function registrarPagamentoAction(data: unknown) {
  const session = await checkAuth(["ADMIN", "TESOURARIA"]);
  const result = PagamentoSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues.map((e) => e.message).join(", "));
  }
  return PagamentoService.registrarPagamento(result.data, session.user.id);
}

export async function cancelarPagamentoAction(id: number) {
  await checkAuth(["ADMIN", "TESOURARIA"]);
  return PagamentoService.cancelarPagamento(id);
}

export async function getPagamentosAction(filters: any = {}) {
  await checkAuth(["ADMIN", "TESOURARIA", "SECRETARIA"]);
  return PagamentoService.getPagamentos(filters);
}

export async function getSituacaoFinanceiraAction(alunoId: number, anoLetivo: string) {
  const session = await checkAuth(["ADMIN", "TESOURARIA", "SECRETARIA", "ALUNO", "ENCARREGADO"]);
  const role = session.user.tipoUsuario;

  // Aluno só pode ver a própria situação
  if (role === "ALUNO") {
    const aluno = await prisma.aluno.findUnique({ where: { usuarioId: session.user.id } });
    if (!aluno || aluno.id !== alunoId) throw new Error("Acesso negado ao registro deste aluno.");
  }

  // Encarregado só pode ver os seus educandos (por nome)
  if (role === "ENCARREGADO") {
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId, deletedAt: null },
      include: { usuario: true },
    });
    if (!aluno || aluno.nomeEncarregado !== session.user.nome) {
      throw new Error("Não tem permissão para ver a situação financeira deste aluno.");
    }
  }

  return PagamentoService.getSituacaoFinanceira(alunoId, anoLetivo);
}

export async function getAlunosParaPagamentoAction() {
  await checkAuth(["ADMIN", "TESOURARIA", "SECRETARIA"]);
  return prisma.aluno.findMany({
    where: { deletedAt: null },
    include: { usuario: true },
    orderBy: { usuario: { nome: "asc" } },
  });
}

export async function getValorPropinaAction() {
  await getServerSession(authOptions); // apenas requer sessão activa
  const config = await prisma.configuracaoEscola.findFirst();
  return config?.valorPropina ? Number(config.valorPropina) : 1200;
}

export async function getAnoLetivoAtivoAction() {
  const config = await prisma.configuracaoEscola.findFirst();
  return config?.anoLetivoAtivo || String(new Date().getFullYear());
}
