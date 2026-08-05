import { TipoUsuario } from "@/src/generated/prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      nome: string;
      email: string;
      tipoUsuario: TipoUsuario;
    } & DefaultSession["user"];
  }

  interface User {
    id: string | number;
    email: string;
    name: string;
    tipoUsuario: TipoUsuario;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    nome: string;
    tipoUsuario: TipoUsuario;
  }
}
