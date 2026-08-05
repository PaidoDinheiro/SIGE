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

export async function getAlunosForBoletimAction() {
  const session = await checkAuth(["ADMIN", "SECRETARIA", "ENCARREGADO"]);
  const role = session.user.tipoUsuario;

  if (role === "ENCARREGADO") {
    // Retorna apenas alunos associados ao encarregado
    return prisma.aluno.findMany({
      where: { 
        nomeEncarregado: session.user.nome,
        deletedAt: null 
      },
      include: { usuario: true }
    });
  }

  // Admin e Secretaria podem ver todos
  return prisma.aluno.findMany({
    where: { deletedAt: null },
    include: { usuario: true },
    orderBy: { usuario: { nome: "asc" } }
  });
}

export async function getMatriculasAtivasForBoletimAction(alunoId?: number) {
  const session = await checkAuth(["ADMIN", "SECRETARIA", "ALUNO", "ENCARREGADO"]);
  const role = session.user.tipoUsuario;

  let targetAlunoId = alunoId;
  if (role === "ALUNO") {
    const student = await prisma.aluno.findUnique({ where: { usuarioId: session.user.id } });
    if (!student) throw new Error("Perfil de aluno não encontrado.");
    targetAlunoId = student.id;
  }

  return prisma.matricula.findMany({
    where: {
      alunoId: targetAlunoId ? targetAlunoId : undefined,
      status: "ATIVA",
      deletedAt: null
    },
    include: {
      turma: true,
      aluno: { include: { usuario: true } }
    }
  });
}
