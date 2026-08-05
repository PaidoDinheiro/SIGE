import { prisma } from "@/src/lib/prisma";
import { AlunoRepository } from "../repositories/AlunoRepository";
import { AlunoInput, AlunoSchema } from "../schemas/AlunoSchema";
import * as bcrypt from "bcryptjs";

export class AlunoService {
  
  static async getAlunos(query?: string) {
    return AlunoRepository.findMany(query);
  }

  static async getAlunoById(id: number) {
    const aluno = await AlunoRepository.findById(id);
    if (!aluno) throw new Error("Aluno não encontrado.");
    return aluno;
  }

  static async createAluno(data: AlunoInput) {
    // Validar Schema
    const result = AlunoSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    if (!validatedData.senha) {
      throw new Error("A palavra-passe é obrigatória para criar um novo utilizador.");
    }

    // Validar Email único
    const emailExiste = await prisma.usuario.findFirst({
      where: { email: validatedData.email, deletedAt: null }
    });
    if (emailExiste) throw new Error("Este endereço de e-mail já está em uso.");

    // Validar BI único
    const biExiste = await prisma.aluno.findFirst({
      where: { numeroBI: validatedData.numeroBI, deletedAt: null }
    });
    if (biExiste) throw new Error("Este número de documento já está registado.");

    // Criptografar Senha
    const senhaHash = await bcrypt.hash(validatedData.senha, 10);

    return AlunoRepository.create({
      nome: validatedData.nome,
      email: validatedData.email,
      senhaHash,
      numeroBI: validatedData.numeroBI,
      dataNascimento: new Date(validatedData.dataNascimento),
      contacto: validatedData.contacto,
      nomeEncarregado: validatedData.nomeEncarregado,
      contactoEncarregado: validatedData.contactoEncarregado,
    });
  }

  static async updateAluno(id: number, data: AlunoInput) {
    const result = AlunoSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const alunoAtual = await this.getAlunoById(id);

    // Validar Email único (excluindo o atual)
    if (validatedData.email !== alunoAtual.usuario.email) {
      const emailExiste = await prisma.usuario.findFirst({
        where: { email: validatedData.email, deletedAt: null }
      });
      if (emailExiste) throw new Error("Este endereço de e-mail já está em uso.");
    }

    // Validar BI único (excluindo o atual)
    if (validatedData.numeroBI !== alunoAtual.numeroBI) {
      const biExiste = await prisma.aluno.findFirst({
        where: { numeroBI: validatedData.numeroBI, deletedAt: null }
      });
      if (biExiste) throw new Error("Este número de documento já está registado.");
    }

    let senhaHash;
    if (validatedData.senha) {
      senhaHash = await bcrypt.hash(validatedData.senha, 10);
    }

    return AlunoRepository.update(id, {
      nome: validatedData.nome,
      email: validatedData.email,
      senhaHash,
      numeroBI: validatedData.numeroBI,
      dataNascimento: new Date(validatedData.dataNascimento),
      contacto: validatedData.contacto,
      nomeEncarregado: validatedData.nomeEncarregado,
      contactoEncarregado: validatedData.contactoEncarregado,
    });
  }

  static async deleteAluno(id: number) {
    // Validar se existe
    await this.getAlunoById(id);
    return AlunoRepository.softDelete(id);
  }
}
