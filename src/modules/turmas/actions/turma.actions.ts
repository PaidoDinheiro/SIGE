"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { TurmaInput } from "../schemas/TurmaSchema";
import { TurmaService } from "../services/TurmaService";
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

export async function getTurmasAction(query?: string) {
  try {
    await checkAuth();
    const data = await TurmaService.getTurmas(query);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTurmaAction(data: TurmaInput) {
  try {
    await checkAuth();
    await TurmaService.createTurma(data);
    revalidatePath("/dashboard/admin/turmas");
    revalidatePath("/dashboard/secretaria/turmas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTurmaAction(id: number, data: TurmaInput) {
  try {
    await checkAuth();
    await TurmaService.updateTurma(id, data);
    revalidatePath("/dashboard/admin/turmas");
    revalidatePath("/dashboard/secretaria/turmas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTurmaAction(id: number) {
  try {
    await checkAuth();
    await TurmaService.deleteTurma(id);
    revalidatePath("/dashboard/admin/turmas");
    revalidatePath("/dashboard/secretaria/turmas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
