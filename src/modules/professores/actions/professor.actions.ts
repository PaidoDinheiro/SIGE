"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { ProfessorInput } from "../schemas/ProfessorSchema";
import { ProfessorService } from "../services/ProfessorService";
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

export async function getProfessoresAction(query?: string) {
  try {
    await checkAuth();
    const data = await ProfessorService.getProfessores(query);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProfessorAction(data: ProfessorInput) {
  try {
    await checkAuth();
    await ProfessorService.createProfessor(data);
    revalidatePath("/dashboard/admin/professores");
    revalidatePath("/dashboard/secretaria/professores");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfessorAction(id: number, data: ProfessorInput) {
  try {
    await checkAuth();
    await ProfessorService.updateProfessor(id, data);
    revalidatePath("/dashboard/admin/professores");
    revalidatePath("/dashboard/secretaria/professores");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProfessorAction(id: number) {
  try {
    await checkAuth();
    await ProfessorService.deleteProfessor(id);
    revalidatePath("/dashboard/admin/professores");
    revalidatePath("/dashboard/secretaria/professores");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
