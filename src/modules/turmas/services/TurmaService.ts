import { prisma } from "@/src/lib/prisma";
import { TurmaRepository } from "../repositories/TurmaRepository";
import { TurmaInput, TurmaSchema } from "../schemas/TurmaSchema";

export class TurmaService {
  
  static async getTurmas(query?: string) {
    return TurmaRepository.findMany(query);
  }

  static async getTurmaById(id: number) {
    const turma = await TurmaRepository.findById(id);
    if (!turma) throw new Error("Turma não encontrada.");
    return turma;
  }

  static async createTurma(data: TurmaInput) {
    const result = TurmaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const turmaExiste = await prisma.turma.findFirst({
      where: { 
        nome: validatedData.nome, 
        anoLetivo: validatedData.anoLetivo, 
        deletedAt: null 
      }
    });
    if (turmaExiste) throw new Error("Já existe uma turma com este nome neste ano letivo.");

    return TurmaRepository.create({
      nome: validatedData.nome,
      anoLetivo: validatedData.anoLetivo,
    });
  }

  static async updateTurma(id: number, data: TurmaInput) {
    const result = TurmaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const turmaAtual = await this.getTurmaById(id);

    if (validatedData.nome !== turmaAtual.nome || validatedData.anoLetivo !== turmaAtual.anoLetivo) {
      const turmaExiste = await prisma.turma.findFirst({
        where: { 
          nome: validatedData.nome, 
          anoLetivo: validatedData.anoLetivo, 
          deletedAt: null 
        }
      });
      if (turmaExiste) throw new Error("Já existe uma turma com este nome neste ano letivo.");
    }

    return TurmaRepository.update(id, {
      nome: validatedData.nome,
      anoLetivo: validatedData.anoLetivo,
    });
  }

  static async deleteTurma(id: number) {
    await this.getTurmaById(id);
    return TurmaRepository.softDelete(id);
  }
}
