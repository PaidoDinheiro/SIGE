import { prisma } from "@/src/lib/prisma";
import { MatriculaRepository } from "../repositories/MatriculaRepository";
import { MatriculaInput, MatriculaSchema } from "../schemas/MatriculaSchema";

export class MatriculaService {
  
  static async getMatriculas(query?: string) {
    return MatriculaRepository.findMany(query);
  }

  static async getMatriculaById(id: number) {
    const matricula = await MatriculaRepository.findById(id);
    if (!matricula) throw new Error("Matrícula não encontrada.");
    return matricula;
  }

  static async createMatricula(data: MatriculaInput) {
    const result = MatriculaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    // Verificar duplicação: Mesmo aluno no mesmo ano letivo
    const matriculaExiste = await prisma.matricula.findFirst({
      where: { 
        alunoId: validatedData.alunoId, 
        anoLetivo: validatedData.anoLetivo, 
        deletedAt: null 
      }
    });
    if (matriculaExiste) {
      throw new Error("Este aluno já possui uma matrícula ativa neste ano letivo.");
    }

    // Verificar se o aluno existe
    const aluno = await prisma.aluno.findUnique({ where: { id: validatedData.alunoId, deletedAt: null } });
    if (!aluno) throw new Error("Aluno selecionado não existe ou foi arquivado.");

    // Verificar se a turma existe
    const turma = await prisma.turma.findUnique({ where: { id: validatedData.turmaId, deletedAt: null } });
    if (!turma) throw new Error("Turma selecionada não existe ou foi arquivada.");

    if (turma.anoLetivo !== validatedData.anoLetivo) {
      throw new Error(`A turma pertence ao ano letivo ${turma.anoLetivo}, mas a matrícula é para ${validatedData.anoLetivo}.`);
    }

    return MatriculaRepository.create({
      alunoId: validatedData.alunoId,
      turmaId: validatedData.turmaId,
      anoLetivo: validatedData.anoLetivo,
      status: validatedData.status as any,
    });
  }

  static async updateMatricula(id: number, data: MatriculaInput) {
    const result = MatriculaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const matriculaAtual = await this.getMatriculaById(id);

    if (validatedData.alunoId !== matriculaAtual.alunoId || validatedData.anoLetivo !== matriculaAtual.anoLetivo) {
      const matriculaExiste = await prisma.matricula.findFirst({
        where: { 
          alunoId: validatedData.alunoId, 
          anoLetivo: validatedData.anoLetivo, 
          deletedAt: null 
        }
      });
      if (matriculaExiste) {
        throw new Error("Este aluno já possui uma matrícula neste ano letivo.");
      }
    }

    return MatriculaRepository.update(id, {
      alunoId: validatedData.alunoId,
      turmaId: validatedData.turmaId,
      anoLetivo: validatedData.anoLetivo,
      status: validatedData.status as any,
    });
  }

  static async deleteMatricula(id: number) {
    await this.getMatriculaById(id);
    return MatriculaRepository.softDelete(id);
  }
}
