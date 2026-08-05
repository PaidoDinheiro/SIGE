"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { AvisoService } from "../services/AvisoService";
import { AvisoInput, AvisoSchema } from "../schemas/AvisoSchema";

async function checkAuth(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Não autenticado.");
  if (allowedRoles && !allowedRoles.includes(session.user.tipoUsuario!)) {
    throw new Error("Acesso negado.");
  }
  return session;
}

export async function getAvisosAction() {
  await checkAuth(); // Qualquer utilizador logado pode ver
  return AvisoService.listarAvisos(false);
}

export async function createAvisoAction(data: AvisoInput) {
  const session = await checkAuth(["ADMIN", "SECRETARIA"]); // Apenas ADMIN e SECRETARIA
  const valid = AvisoSchema.parse(data);
  return AvisoService.criarAviso({ ...valid, autorId: session.user.id });
}

export async function updateAvisoAction(id: number, data: AvisoInput) {
  const session = await checkAuth(["ADMIN", "SECRETARIA"]);
  const valid = AvisoSchema.parse(data);
  return AvisoService.atualizarAviso(id, valid, session.user.id);
}

export async function deleteAvisoAction(id: number) {
  const session = await checkAuth(["ADMIN", "SECRETARIA"]);
  return AvisoService.eliminarAviso(id, session.user.id);
}
