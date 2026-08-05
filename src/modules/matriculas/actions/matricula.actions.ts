"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { MatriculaInput } from "../schemas/MatriculaSchema";
import { MatriculaService } from "../services/MatriculaService";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Não autenticado.");
  }
  
  const role = session.user.tipoUsuario;
  if (role !== "ADMIN" && role !== "SECRETARIA") {
    throw new Error("Acesso negado. Apenas Admin e Secretaria podem realizar esta ação.");
  }
  
  return session;
}

export async function getMatriculasAction(query?: string) {
  try {
    await checkAuth();
    const data = await MatriculaService.getMatriculas(query);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createMatriculaAction(data: MatriculaInput) {
  try {
    await checkAuth();
    await MatriculaService.createMatricula(data);
    revalidatePath("/dashboard/admin/matriculas");
    revalidatePath("/dashboard/secretaria/matriculas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMatriculaAction(id: number, data: MatriculaInput) {
  try {
    await checkAuth();
    await MatriculaService.updateMatricula(id, data);
    revalidatePath("/dashboard/admin/matriculas");
    revalidatePath("/dashboard/secretaria/matriculas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMatriculaAction(id: number) {
  try {
    await checkAuth();
    await MatriculaService.deleteMatricula(id);
    revalidatePath("/dashboard/admin/matriculas");
    revalidatePath("/dashboard/secretaria/matriculas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helpers for the select inputs
export async function getAlunosForSelectAction() {
  await checkAuth();
  return prisma.aluno.findMany({
    where: { deletedAt: null },
    include: { usuario: true },
    orderBy: { usuario: { nome: "asc" } }
  });
}

export async function getTurmasForSelectAction() {
  await checkAuth();
  return prisma.turma.findMany({
    where: { deletedAt: null },
    orderBy: { nome: "asc" }
  });
}
