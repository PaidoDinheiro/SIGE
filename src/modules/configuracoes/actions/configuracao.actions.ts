"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { ConfiguracaoService } from "../services/ConfiguracaoService";
import { ConfiguracaoEscolaInput } from "../schemas/ConfiguracaoSchema";

export async function getConfiguracaoAction() {
  try {
    const config = await ConfiguracaoService.getConfiguracao();
    return { success: true, data: config };
  } catch (error: any) {
    console.error("Erro ao ler configurações:", error);
    return { success: false, error: "Ocorreu um erro ao carregar as configurações." };
  }
}

export async function updateConfiguracaoAction(data: ConfiguracaoEscolaInput) {
  try {
    const session = await getServerSession(authOptions);

    // Verificação de segurança (RBAC no servidor)
    if (!session || !session.user || session.user.tipoUsuario !== "ADMIN") {
      return { success: false, error: "Acesso negado. Apenas administradores podem alterar as configurações." };
    }

    const config = await ConfiguracaoService.updateConfiguracao(data);
    return { success: true, data: config };
  } catch (error: any) {
    console.error("Erro ao atualizar configurações:", error);
    return { success: false, error: error.message || "Ocorreu um erro ao atualizar as configurações." };
  }
}
