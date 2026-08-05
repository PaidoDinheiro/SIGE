"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { DisciplinaInput } from "../schemas/DisciplinaSchema";
import { DisciplinaService } from "../services/DisciplinaService";
import { revalidatePath } from "next/cache";

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

export async function getDisciplinasAction(query?: string) {
  try {
    await checkAuth();
    const data = await DisciplinaService.getDisciplinas(query);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createDisciplinaAction(data: DisciplinaInput) {
  try {
    await checkAuth();
    await DisciplinaService.createDisciplina(data);
    revalidatePath("/dashboard/admin/disciplinas");
    revalidatePath("/dashboard/secretaria/disciplinas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDisciplinaAction(id: number, data: DisciplinaInput) {
  try {
    await checkAuth();
    await DisciplinaService.updateDisciplina(id, data);
    revalidatePath("/dashboard/admin/disciplinas");
    revalidatePath("/dashboard/secretaria/disciplinas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDisciplinaAction(id: number) {
  try {
    await checkAuth();
    await DisciplinaService.deleteDisciplina(id);
    revalidatePath("/dashboard/admin/disciplinas");
    revalidatePath("/dashboard/secretaria/disciplinas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
