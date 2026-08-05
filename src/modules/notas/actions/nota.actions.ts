"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { NotaInput } from "../schemas/NotaSchema";
import { NotaService } from "../services/NotaService";
import { revalidatePath } from "next/cache";
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

export async function getNotasAction(query?: string) {
  try {
    const session = await checkAuth(["ADMIN", "SECRETARIA", "PROFESSOR", "ALUNO", "ENCARREGADO"]);
    const role = session.user.tipoUsuario;
    const userId = session.user.id;

    let filterAlunoIds: number[] | undefined;

    // ALUNO: só vê as suas próprias notas
    if (role === "ALUNO") {
      const aluno = await prisma.aluno.findUnique({ where: { usuarioId: userId } });
      if (!aluno) return { success: true, data: [] };
      filterAlunoIds = [aluno.id];
    }

    // ENCARREGADO: só vê notas dos seus educandos
    if (role === "ENCARREGADO") {
      const educandos = await prisma.aluno.findMany({
        where: { nomeEncarregado: session.user.nome, deletedAt: null },
      });
      if (educandos.length === 0) return { success: true, data: [] };
      filterAlunoIds = educandos.map(e => e.id);
    }

    // PROFESSOR: só vê notas das suas turmas/disciplinas
    if (role === "PROFESSOR") {
      const tds = await prisma.turmaDisciplina.findMany({
        where: { professorId: userId, deletedAt: null },
        select: { id: true }
      });
      const tdIds = tds.map(td => td.id);
      const data = await prisma.nota.findMany({
        where: {
          turmaDisciplinaId: { in: tdIds },
          ...(query ? {
            OR: [
              { aluno: { usuario: { nome: { contains: query } } } },
              { disciplina: { nome: { contains: query } } },
            ]
          } : {}),
        },
        include: {
          aluno: { include: { usuario: true } },
          disciplina: true,
          turmaDisciplina: { include: { turma: true, professor: true } }
        },
        orderBy: { createdAt: "desc" }
      });
      return { success: true, data };
    }

    // ADMIN / SECRETARIA: veem tudo. ALUNO / ENCARREGADO: filtrado por alunoIds
    const data = await prisma.nota.findMany({
      where: {
        ...(filterAlunoIds ? { alunoId: { in: filterAlunoIds } } : {}),
        ...(query ? {
          OR: [
            { aluno: { usuario: { nome: { contains: query } } } },
            { disciplina: { nome: { contains: query } } },
          ]
        } : {}),
      },
      include: {
        aluno: { include: { usuario: true } },
        disciplina: true,
        turmaDisciplina: { include: { turma: true, professor: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createNotaAction(data: NotaInput) {
  try {
    const session = await checkAuth(["ADMIN", "PROFESSOR"]);
    await NotaService.createNota(data, session.user.id, session.user.tipoUsuario);
    revalidatePath("/dashboard/admin/notas");
    revalidatePath("/dashboard/professor/notas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateNotaAction(id: number, data: NotaInput) {
  try {
    const session = await checkAuth(["ADMIN", "PROFESSOR"]);
    await NotaService.updateNota(id, data, session.user.id, session.user.tipoUsuario);
    revalidatePath("/dashboard/admin/notas");
    revalidatePath("/dashboard/professor/notas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Para carregar os dados necessários no formulário de notas
export async function getMatriculasForNotasAction(turmaId?: number) {
  await checkAuth(["ADMIN", "PROFESSOR"]);
  return prisma.matricula.findMany({
    where: { 
      status: "ATIVA", 
      deletedAt: null,
      ...(turmaId ? { turmaId } : {}),
    },
    include: {
      aluno: { include: { usuario: true } },
      turma: true
    },
    orderBy: { aluno: { usuario: { nome: "asc" } } }
  });
}

export async function getTurmasDisciplinasForNotasAction(professorId?: number) {
  const session = await checkAuth(["ADMIN", "PROFESSOR"]);
  const isProfessor = session.user.tipoUsuario === "PROFESSOR";
  const pid = isProfessor ? session.user.id : professorId;

  return prisma.turmaDisciplina.findMany({
    where: { 
      deletedAt: null,
      professorId: pid ? pid : undefined
    },
    include: {
      turma: true,
      disciplina: true,
      professor: true
    }
  });
}

// Obter lista de turmas do professor (para filtros)
export async function getTurmasForProfessorAction() {
  const session = await checkAuth(["ADMIN", "PROFESSOR"]);
  const isProfessor = session.user.tipoUsuario === "PROFESSOR";

  if (isProfessor) {
    const tds = await prisma.turmaDisciplina.findMany({
      where: { professorId: session.user.id, deletedAt: null },
      include: { turma: true },
      distinct: ["turmaId"]
    });
    return tds.map(td => td.turma);
  }

  // ADMIN vê todas as turmas
  return prisma.turma.findMany({
    where: { deletedAt: null },
    orderBy: { nome: "asc" }
  });
}

// Obter educandos do encarregado
export async function getEducandosAction() {
  const session = await checkAuth(["ENCARREGADO"]);
  const educandos = await prisma.aluno.findMany({
    where: { nomeEncarregado: session.user.nome, deletedAt: null },
    include: { usuario: true }
  });
  return educandos;
}
