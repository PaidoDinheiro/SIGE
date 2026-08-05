"use server";

import { loginSchema, LoginInput } from "@/src/validators/auth.schema";
import { AuthService } from "@/src/services/auth.service";
import { getDefaultDashboard } from "@/src/lib/rbac";

export type LoginResult = {
  success: boolean;
  error?: string;
  redirectTo?: string;
};

export async function loginAction(data: LoginInput): Promise<LoginResult> {
  const parseResult = loginSchema.safeParse(data);

  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0].message };
  }

  const { email, password } = parseResult.data;

  try {
    const user = await AuthService.validateCredentials(email, password);

    if (!user) {
      return {
        success: false,
        error: "E-mail ou palavra-passe incorretos, ou conta desativada.",
      };
    }

    const redirectTo = getDefaultDashboard(user.tipoUsuario);

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error("Erro na Server Action de Login:", error);
    return {
      success: false,
      error: "Ocorreu um erro inesperado ao processar o acesso. Tente novamente.",
    };
  }
}
