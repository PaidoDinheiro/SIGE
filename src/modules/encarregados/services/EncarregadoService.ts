import { prisma } from "@/src/lib/prisma";
import { EncarregadoRepository } from "../repositories/EncarregadoRepository";
import { EncarregadoInput, EncarregadoSchema } from "../schemas/EncarregadoSchema";
import * as bcrypt from "bcryptjs";

export class EncarregadoService {
  
  static async getEncarregados(query?: string) {
    return EncarregadoRepository.findMany(query);
  }

  static async getEncarregadoById(id: number) {
    const encarregado = await EncarregadoRepository.findById(id);
    if (!encarregado) throw new Error("Encarregado não encontrado.");
    return encarregado;
  }

  static async createEncarregado(data: EncarregadoInput) {
    const result = EncarregadoSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    if (!validatedData.senha) {
      throw new Error("A palavra-passe é obrigatória para criar um novo encarregado.");
    }

    const emailExiste = await prisma.usuario.findFirst({
      where: { email: validatedData.email, deletedAt: null }
    });
    if (emailExiste) throw new Error("Este endereço de e-mail já está em uso.");

    const senhaHash = await bcrypt.hash(validatedData.senha, 10);

    return EncarregadoRepository.create({
      nome: validatedData.nome,
      email: validatedData.email,
      senhaHash,
      ativo: validatedData.ativo,
    });
  }

  static async updateEncarregado(id: number, data: EncarregadoInput) {
    const result = EncarregadoSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const encarregadoAtual = await this.getEncarregadoById(id);

    if (validatedData.email !== encarregadoAtual.email) {
      const emailExiste = await prisma.usuario.findFirst({
        where: { email: validatedData.email, deletedAt: null }
      });
      if (emailExiste) throw new Error("Este endereço de e-mail já está em uso.");
    }

    let senhaHash;
    if (validatedData.senha) {
      senhaHash = await bcrypt.hash(validatedData.senha, 10);
    }

    return EncarregadoRepository.update(id, {
      nome: validatedData.nome,
      email: validatedData.email,
      senhaHash,
      ativo: validatedData.ativo,
    });
  }

  static async deleteEncarregado(id: number) {
    await this.getEncarregadoById(id);
    return EncarregadoRepository.softDelete(id);
  }
}
