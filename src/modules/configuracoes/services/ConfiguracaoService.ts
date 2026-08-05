import { ConfiguracaoRepository } from "../repositories/ConfiguracaoRepository";
import { ConfiguracaoEscolaInput, ConfiguracaoEscolaSchema } from "../schemas/ConfiguracaoSchema";

export class ConfiguracaoService {
  /**
   * Obtém a configuração atual ou devolve null se não existir.
   */
  static async getConfiguracao() {
    return ConfiguracaoRepository.getConfiguracao();
  }

  /**
   * Atualiza a configuração. Apenas o perfil ADMIN pode fazer isto (validação feita na action).
   * Lança um erro se os dados forem inválidos.
   */
  static async updateConfiguracao(data: ConfiguracaoEscolaInput) {
    // Validar com Zod
    const result = ConfiguracaoEscolaSchema.safeParse(data);
    
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }

    return ConfiguracaoRepository.upsertConfiguracao(result.data);
  }
}
