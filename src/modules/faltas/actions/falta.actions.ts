"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { FaltaInput } from "../schemas/FaltaSchema";
import { FaltaService } from "../services/FaltaService";
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

export async function getFaltasAction(query?: string, turmaId?: number) {
  try {
    const session = await checkAuth(["ADMIN", "SECRETARIA", "PROFESSOR", "ALUNO", "ENCARREGADO"]);
    const role = session.user.tipoUsuario;
    const userId = session.user.id;

    let filterAlunoIds: number[] | undefined;
    let filterTdIds: number[] | undefined;

    // ALUNO: só vê as suas próprias faltas
    if (role === "ALUNO") {
      const aluno = await prisma.aluno.findUnique({ where: { usuarioId: userId } });
      if (!aluno) return { success: true, data: [] };
      filterAlunoIds = [aluno.id];
    }

    // ENCARREGADO: só vê faltas dos seus educandos
    if (role === "ENCARREGADO") {
      const educandos = await prisma.aluno.findMany({
        where: { nomeEncarregado: session.user.nome, deletedAt: null },
      });
      if (educandos.length === 0) return { success: true, data: [] };
      filterAlunoIds = educandos.map(e => e.id);
    }

    // PROFESSOR: só vê faltas das suas turmas/disciplinas
    if (role === "PROFESSOR") {
      const tds = await prisma.turmaDisciplina.findMany({
        where: { professorId: userId, deletedAt: null },
        select: { id: true, turmaId: true }
      });
      filterTdIds = turmaId 
        ? tds.filter(td => td.turmaId === turmaId).map(td => td.id)
        : tds.map(td => td.id);
    }

    // ADMIN filtro por turma (opcional)
    if ((role === "ADMIN" || role === "SECRETARIA") && turmaId) {
      const tds = await prisma.turmaDisciplina.findMany({
        where: { turmaId, deletedAt: null },
        select: { id: true }
      });
      filterTdIds = tds.map(td => td.id);
    }

    const data = await prisma.falta.findMany({
      where: {
        ...(filterAlunoIds ? { alunoId: { in: filterAlunoIds } } : {}),
        ...(filterTdIds ? { turmaDisciplinaId: { in: filterTdIds } } : {}),
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
      orderBy: { data: "desc" }
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFaltaAction(data: FaltaInput) {
  try {
    const session = await checkAuth(["ADMIN", "PROFESSOR"]);
    await FaltaService.createFalta(data, session.user.id, session.user.tipoUsuario);
    revalidatePath("/dashboard/admin/faltas");
    revalidatePath("/dashboard/professor/faltas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFaltaAction(id: number, data: FaltaInput) {
  try {
    const session = await checkAuth(["ADMIN", "PROFESSOR"]);
    await FaltaService.updateFalta(id, data, session.user.id, session.user.tipoUsuario);
    revalidatePath("/dashboard/admin/faltas");
    revalidatePath("/dashboard/professor/faltas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFaltaAction(id: number) {
  try {
    const session = await checkAuth(["ADMIN", "PROFESSOR"]);
    await FaltaService.deleteFalta(id, session.user.id, session.user.tipoUsuario);
    revalidatePath("/dashboard/admin/faltas");
    revalidatePath("/dashboard/professor/faltas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
