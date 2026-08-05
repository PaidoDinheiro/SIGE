import bcrypt from "bcryptjs";
import { UserRepository } from "@/src/repositories/user.repository";
import { TipoUsuario, Usuario } from "@/src/generated/prisma/client";

export type SafeUser = Omit<Usuario, "senha">;

export class AuthService {
  static async validateCredentials(
    email: string,
    password: string
  ): Promise<SafeUser | null> {
    const user = await UserRepository.findUserByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.ativo || user.deletedAt !== null) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha);

    if (!isPasswordValid) {
      return null;
    }

    // Atualizar timestamp de último login
    await UserRepository.updateLastLogin(user.id);

    // Retornar utilizador seguro sem a palavra-passe
    const { senha, ...safeUser } = user;
    return safeUser;
  }

  static async seedInitialAdmin(): Promise<{ created: boolean; message: string }> {
    const adminCount = await UserRepository.countAdminUsers();

    if (adminCount > 0) {
      return { created: false, message: "Já existe pelo menos um administrador cadastrado." };
    }

    const name = process.env.ADMIN_INITIAL_NAME || "Administrador Geral";
    const email = process.env.ADMIN_INITIAL_EMAIL || "admin@catedral.co.mz";
    const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminCatedral2026!";

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await UserRepository.createUser({
      nome: name,
      email,
      senha: hashedPassword,
      tipoUsuario: TipoUsuario.ADMIN,
      ativo: true,
    });

    return { created: true, message: `Utilizador ADMIN inicial (${email}) criado com sucesso.` };
  }
}
