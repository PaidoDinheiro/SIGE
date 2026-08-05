import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

type TipoUsuario = "ADMIN" | "SECRETARIA" | "TESOURARIA" | "PROFESSOR" | "ALUNO" | "ENCARREGADO";

const ROLE_DASHBOARDS: Record<TipoUsuario, string> = {
  ADMIN: "/dashboard/admin",
  SECRETARIA: "/dashboard/secretaria",
  TESOURARIA: "/dashboard/tesouraria",
  PROFESSOR: "/dashboard/professor",
  ALUNO: "/dashboard/aluno",
  ENCARREGADO: "/dashboard/encarregado",
};

function getDefaultDashboard(tipoUsuario: TipoUsuario): string {
  return ROLE_DASHBOARDS[tipoUsuario] || "/dashboard/admin";
}

function isRouteAllowedForRole(pathname: string, tipoUsuario: TipoUsuario): boolean {
  if (tipoUsuario === "ADMIN") {
    return true;
  }

  const userDashboard = ROLE_DASHBOARDS[tipoUsuario];
  if (userDashboard && pathname.startsWith(userDashboard)) {
    return true;
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return true;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/login");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // 1. Não autenticado tentando aceder ao dashboard
  if (!token && isDashboardPage) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Autenticado tentando aceder à página de login
  if (token && isAuthPage) {
    const tipoUsuario = token.tipoUsuario as TipoUsuario;
    const targetDashboard = getDefaultDashboard(tipoUsuario);
    return NextResponse.redirect(new URL(targetDashboard, req.url));
  }

  // 3. Autenticado tentando aceder ao dashboard raiz (/dashboard)
  if (token && (pathname === "/dashboard" || pathname === "/dashboard/")) {
    const tipoUsuario = token.tipoUsuario as TipoUsuario;
    const targetDashboard = getDefaultDashboard(tipoUsuario);
    return NextResponse.redirect(new URL(targetDashboard, req.url));
  }

  // 4. Autenticado tentando aceder a uma rota não autorizada para o seu perfil
  if (token && isDashboardPage) {
    const tipoUsuario = token.tipoUsuario as TipoUsuario;
    if (!isRouteAllowedForRole(pathname, tipoUsuario)) {
      const targetDashboard = getDefaultDashboard(tipoUsuario);
      return NextResponse.redirect(new URL(targetDashboard, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
