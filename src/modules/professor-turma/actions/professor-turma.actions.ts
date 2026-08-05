"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { ProfessorTurmaInput } from "../schemas/ProfessorTurmaSchema";
import { ProfessorTurmaService } from "../services/ProfessorTurmaService";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";

async function checkAuthAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Não autenticado.");
  }
  
  if (session.user.tipoUsuario !== "ADMIN") {
    throw new Error("Acesso negado. Apenas o Administrador pode realizar esta ação.");
  }
  
  return session;
}

export async function getAssociacoesAction(query?: string) {
  try {
    await checkAuthAdmin();
    const data = await ProfessorTurmaService.getAssociacoes(query);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAssociacaoAction(data: ProfessorTurmaInput) {
  try {
    await checkAuthAdmin();
    await ProfessorTurmaService.createAssociacao(data);
    revalidatePath("/dashboard/admin/professor-turma");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAssociacaoAction(id: number, data: ProfessorTurmaInput) {
  try {
    await checkAuthAdmin();
    await ProfessorTurmaService.updateAssociacao(id, data);
    revalidatePath("/dashboard/admin/professor-turma");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAssociacaoAction(id: number) {
  try {
    await checkAuthAdmin();
    await ProfessorTurmaService.deleteAssociacao(id);
    revalidatePath("/dashboard/admin/professor-turma");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helpers for the select inputs
export async function getProfessoresForSelectAction() {
  await checkAuthAdmin();
  return prisma.usuario.findMany({
    where: { tipoUsuario: "PROFESSOR", deletedAt: null },
    orderBy: { nome: "asc" }
  });
}

export async function getTurmasForSelectAction() {
  await checkAuthAdmin();
  return prisma.turma.findMany({
    where: { deletedAt: null },
    orderBy: { nome: "asc" }
  });
}

export async function getDisciplinasForSelectAction() {
  await checkAuthAdmin();
  return prisma.disciplina.findMany({
    where: { deletedAt: null },
    orderBy: { nome: "asc" }
  });
}
