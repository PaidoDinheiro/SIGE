"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { AlunoInput } from "../schemas/AlunoSchema";
import { AlunoService } from "../services/AlunoService";
import { revalidatePath } from "next/cache";

// RBAC
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

export async function getAlunosAction(query?: string) {
  try {
    await checkAuth();
    const data = await AlunoService.getAlunos(query);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAlunoAction(data: AlunoInput) {
  try {
    await checkAuth();
    await AlunoService.createAluno(data);
    revalidatePath("/dashboard/admin/alunos");
    revalidatePath("/dashboard/secretaria/alunos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAlunoAction(id: number, data: AlunoInput) {
  try {
    await checkAuth();
    await AlunoService.updateAluno(id, data);
    revalidatePath("/dashboard/admin/alunos");
    revalidatePath("/dashboard/secretaria/alunos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAlunoAction(id: number) {
  try {
    await checkAuth();
    await AlunoService.deleteAluno(id);
    revalidatePath("/dashboard/admin/alunos");
    revalidatePath("/dashboard/secretaria/alunos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
