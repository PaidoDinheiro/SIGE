"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

async function checkAuth(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Não autenticado.");
  }
  const role = session.user.tipoUsuario;
  if (!allowedRoles.includes(role)) {
    throw new Error("Acesso negado.");
  }
  return session;
}

export async function getTurmasForPautaAction() {
  await checkAuth(["ADMIN", "SECRETARIA"]);
  return prisma.turma.findMany({
    where: { deletedAt: null },
    orderBy: { nome: "asc" }
  });
}

export async function getDisciplinasDaTurmaForPautaAction(turmaId: number) {
  await checkAuth(["ADMIN", "SECRETARIA"]);
  const associations = await prisma.turmaDisciplina.findMany({
    where: { turmaId, deletedAt: null },
    include: { disciplina: true }
  });
  return associations.map(a => a.disciplina);
}
