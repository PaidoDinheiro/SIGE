import { TipoUsuario } from "@/src/generated/prisma/client";

export const ROLE_DASHBOARDS: Record<TipoUsuario, string> = {
  [TipoUsuario.ADMIN]: "/dashboard/admin",
  [TipoUsuario.SECRETARIA]: "/dashboard/secretaria",
  [TipoUsuario.TESOURARIA]: "/dashboard/tesouraria",
  [TipoUsuario.PROFESSOR]: "/dashboard/professor",
  [TipoUsuario.ALUNO]: "/dashboard/aluno",
  [TipoUsuario.ENCARREGADO]: "/dashboard/encarregado",
};

export function getDefaultDashboard(tipoUsuario: TipoUsuario): string {
  return ROLE_DASHBOARDS[tipoUsuario] || "/dashboard/admin";
}

export function isRouteAllowedForRole(pathname: string, tipoUsuario: TipoUsuario): boolean {
  if (tipoUsuario === TipoUsuario.ADMIN) {
    return true;
  }

  const userDashboard = ROLE_DASHBOARDS[tipoUsuario];
  if (pathname.startsWith(userDashboard)) {
    return true;
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return true;
  }

  return false;
}
