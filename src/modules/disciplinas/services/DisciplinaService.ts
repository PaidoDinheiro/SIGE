import { prisma } from "@/src/lib/prisma";
import { DisciplinaRepository } from "../repositories/DisciplinaRepository";
import { DisciplinaInput, DisciplinaSchema } from "../schemas/DisciplinaSchema";

export class DisciplinaService {
  
  static async getDisciplinas(query?: string) {
    return DisciplinaRepository.findMany(query);
  }

  static async getDisciplinaById(id: number) {
    const disciplina = await DisciplinaRepository.findById(id);
    if (!disciplina) throw new Error("Disciplina não encontrada.");
    return disciplina;
  }

  static async createDisciplina(data: DisciplinaInput) {
    const result = DisciplinaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const disciplinaExiste = await prisma.disciplina.findFirst({
      where: { 
        nome: validatedData.nome, 
        deletedAt: null 
      }
    });
    if (disciplinaExiste) throw new Error("Já existe uma disciplina com este nome.");

    return DisciplinaRepository.create({
      nome: validatedData.nome,
    });
  }

  static async updateDisciplina(id: number, data: DisciplinaInput) {
    const result = DisciplinaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const disciplinaAtual = await this.getDisciplinaById(id);

    if (validatedData.nome !== disciplinaAtual.nome) {
      const disciplinaExiste = await prisma.disciplina.findFirst({
        where: { 
          nome: validatedData.nome, 
          deletedAt: null 
        }
      });
      if (disciplinaExiste) throw new Error("Já existe uma disciplina com este nome.");
    }

    return DisciplinaRepository.update(id, {
      nome: validatedData.nome,
    });
  }

  static async deleteDisciplina(id: number) {
    await this.getDisciplinaById(id);
    return DisciplinaRepository.softDelete(id);
  }
}
