import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

async function main() {
  console.log("🌱 A iniciar a população inicial de dados (Seed)...");

  // PrismaMariaDb é uma Factory — passar ao PrismaClient como adapter (não chamar .connect())
  // O PrismaClient chama .connect() internamente quando necessário
  const adapterFactory = new PrismaMariaDb({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Clinton",
    database: process.env.DB_NAME || "sge",
    connectionLimit: 3,
  });

  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const prisma = new (PrismaClient as any)({ adapter: adapterFactory });

  try {
    const adminCount = await prisma.usuario.count({
      where: {
        tipoUsuario: "ADMIN",
        deletedAt: null,
      },
    });

    if (adminCount > 0) {
      console.log("📌 Já existe pelo menos um administrador cadastrado. Seed ignorado.");
    } else {
      const name = process.env.ADMIN_INITIAL_NAME || "Administrador Geral";
      const email = process.env.ADMIN_INITIAL_EMAIL || "admin@catedral.co.mz";
      const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminCatedral2026!";
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      await prisma.usuario.create({
        data: {
          nome: name,
          email,
          senha: hashedPassword,
          tipoUsuario: "ADMIN",
          ativo: true,
        },
      });

      console.log(`📌 Utilizador ADMIN (${email}) criado com sucesso.`);
    }

    const configCount = await prisma.configuracaoEscola.count();
    if (configCount > 0) {
      console.log("📌 Configuração inicial já existente. Ignorada.");
    } else {
      await prisma.configuracaoEscola.create({
        data: {
          nome: "Escola Da Catedral – Beira",
          endereco: "Ponte Gea, Beira, Sofala, Moçambique",
          diretor: "Frei Neto Nhampoca",
          anoLetivoAtivo: "2026",
          numeroTrimestres: 3,
          notaMinimaAprovacao: 10,
          valorPropina: 1200,
        },
      });
      console.log("📌 Configuração inicial da escola criada com sucesso.");
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("✅ Seed concluído com sucesso.");
}

main().catch((error) => {
  console.error("❌ Erro durante a execução do seed:", error);
  process.exit(1);
});
