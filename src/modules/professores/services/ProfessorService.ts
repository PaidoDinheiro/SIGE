import { prisma } from "@/src/lib/prisma";
import { ProfessorRepository } from "../repositories/ProfessorRepository";
import { ProfessorInput, ProfessorSchema } from "../schemas/ProfessorSchema";
import * as bcrypt from "bcryptjs";

export class ProfessorService {
  
  static async getProfessores(query?: string) {
    return ProfessorRepository.findMany(query);
  }

  static async getProfessorById(id: number) {
    const professor = await ProfessorRepository.findById(id);
    if (!professor) throw new Error("Professor não encontrado.");
    return professor;
  }

  static async createProfessor(data: ProfessorInput) {
    const result = ProfessorSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    if (!validatedData.senha) {
      throw new Error("A palavra-passe é obrigatória para criar um novo professor.");
    }

    const emailExiste = await prisma.usuario.findFirst({
      where: { email: validatedData.email, deletedAt: null }
    });
    if (emailExiste) throw new Error("Este endereço de e-mail já está em uso.");

    const senhaHash = await bcrypt.hash(validatedData.senha, 10);

    return ProfessorRepository.create({
      nome: validatedData.nome,
      email: validatedData.email,
      senhaHash,
      ativo: validatedData.ativo,
    });
  }

  static async updateProfessor(id: number, data: ProfessorInput) {
    const result = ProfessorSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const professorAtual = await this.getProfessorById(id);

    if (validatedData.email !== professorAtual.email) {
      const emailExiste = await prisma.usuario.findFirst({
        where: { email: validatedData.email, deletedAt: null }
      });
      if (emailExiste) throw new Error("Este endereço de e-mail já está em uso.");
    }

    let senhaHash;
    if (validatedData.senha) {
      senhaHash = await bcrypt.hash(validatedData.senha, 10);
    }

    return ProfessorRepository.update(id, {
      nome: validatedData.nome,
      email: validatedData.email,
      senhaHash,
      ativo: validatedData.ativo,
    });
  }

  static async deleteProfessor(id: number) {
    await this.getProfessorById(id);
    return ProfessorRepository.softDelete(id);
  }
}
