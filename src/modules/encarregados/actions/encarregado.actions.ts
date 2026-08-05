"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { EncarregadoInput } from "../schemas/EncarregadoSchema";
import { EncarregadoService } from "../services/EncarregadoService";
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

export async function getEncarregadosAction(query?: string) {
  try {
    await checkAuth();
    const data = await EncarregadoService.getEncarregados(query);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createEncarregadoAction(data: EncarregadoInput) {
  try {
    await checkAuth();
    await EncarregadoService.createEncarregado(data);
    revalidatePath("/dashboard/admin/encarregados");
    revalidatePath("/dashboard/secretaria/encarregados");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEncarregadoAction(id: number, data: EncarregadoInput) {
  try {
    await checkAuth();
    await EncarregadoService.updateEncarregado(id, data);
    revalidatePath("/dashboard/admin/encarregados");
    revalidatePath("/dashboard/secretaria/encarregados");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEncarregadoAction(id: number) {
  try {
    await checkAuth();
    await EncarregadoService.deleteEncarregado(id);
    revalidatePath("/dashboard/admin/encarregados");
    revalidatePath("/dashboard/secretaria/encarregados");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
