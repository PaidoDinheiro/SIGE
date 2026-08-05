import { prisma } from "@/src/lib/prisma";
import { ConfiguracaoEscola, Prisma } from "@/src/generated/prisma/client";

export class ConfiguracaoRepository {
  /**
   * Obtém a configuração atual da escola (o primeiro registo).
   */
  static async getConfiguracao(): Promise<ConfiguracaoEscola | null> {
    return prisma.configuracaoEscola.findFirst({
      orderBy: { id: "asc" },
    });
  }

  /**
   * Atualiza a configuração existente ou cria uma nova se não existir.
   */
  static async upsertConfiguracao(data: Omit<Prisma.ConfiguracaoEscolaCreateInput, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfiguracaoEscola> {
    const config = await this.getConfiguracao();

    if (config) {
      return prisma.configuracaoEscola.update({
        where: { id: config.id },
        data,
      });
    }

    return prisma.configuracaoEscola.create({
      data,
    });
  }
}
