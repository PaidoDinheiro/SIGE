import { prisma } from "@/src/lib/prisma";
import { FaltaRepository } from "../repositories/FaltaRepository";
import { FaltaInput, FaltaSchema } from "../schemas/FaltaSchema";
import { startOfDay, endOfDay } from "date-fns";

export class FaltaService {
  
  static async getFaltas(query?: string) {
    return FaltaRepository.findMany(query);
  }

  static async getFaltaById(id: number) {
    const falta = await FaltaRepository.findById(id);
    if (!falta) throw new Error("Falta não encontrada.");
    return falta;
  }

  static async createFalta(data: FaltaInput, usuarioIdLogado: number, tipoUsuarioLogado: string) {
    const result = FaltaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;
    const faltaDate = new Date(validatedData.data);

    const turmaDisc = await prisma.turmaDisciplina.findUnique({ where: { id: validatedData.turmaDisciplinaId } });
    if (!turmaDisc) throw new Error("Associação Turma/Disciplina não existe.");

    if (tipoUsuarioLogado === "PROFESSOR") {
      if (turmaDisc.professorId !== usuarioIdLogado) {
        throw new Error("Não tem permissão para lançar faltas nesta disciplina.");
      }
    }

    // Anti-duplicação: o mesmo aluno não pode ter 2 faltas na mesma turma/disciplina no MESMO DIA.
    const faltaExiste = await prisma.falta.findFirst({
      where: { 
        alunoId: validatedData.alunoId, 
        turmaDisciplinaId: validatedData.turmaDisciplinaId, 
        data: {
          gte: startOfDay(faltaDate),
          lte: endOfDay(faltaDate)
        }
      }
    });
    if (faltaExiste) {
      throw new Error("Já existe uma falta registrada para este aluno nesta disciplina na data selecionada.");
    }

    return FaltaRepository.create({
      alunoId: validatedData.alunoId,
      matriculaId: validatedData.matriculaId,
      turmaDisciplinaId: validatedData.turmaDisciplinaId,
      disciplinaId: turmaDisc.disciplinaId,
      data: faltaDate,
      tipo: validatedData.tipo as any,
      observacao: validatedData.observacao,
    });
  }

  static async updateFalta(id: number, data: FaltaInput, usuarioIdLogado: number, tipoUsuarioLogado: string) {
    const result = FaltaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;
    const faltaDate = new Date(validatedData.data);
    
    const faltaAtual = await this.getFaltaById(id);

    if (tipoUsuarioLogado === "PROFESSOR") {
      const turmaDisc = await prisma.turmaDisciplina.findUnique({ where: { id: faltaAtual.turmaDisciplinaId } });
      if (turmaDisc && turmaDisc.professorId !== usuarioIdLogado) {
        throw new Error("Não tem permissão para alterar faltas nesta disciplina.");
      }
    }

    // Verificar se mudou a data para evitar duplicação no update
    const mudouData = faltaAtual.data.toDateString() !== faltaDate.toDateString();
    if (mudouData) {
      const faltaExiste = await prisma.falta.findFirst({
        where: { 
          alunoId: faltaAtual.alunoId, 
          turmaDisciplinaId: faltaAtual.turmaDisciplinaId, 
          data: {
            gte: startOfDay(faltaDate),
            lte: endOfDay(faltaDate)
          }
        }
      });
      if (faltaExiste) {
        throw new Error("Já existe uma falta registrada para este aluno nesta disciplina na nova data.");
      }
    }

    return FaltaRepository.update(id, {
      data: faltaDate,
      tipo: validatedData.tipo as any,
      observacao: validatedData.observacao,
    });
  }

  static async deleteFalta(id: number, usuarioIdLogado: number, tipoUsuarioLogado: string) {
    const faltaAtual = await this.getFaltaById(id);

    if (tipoUsuarioLogado === "PROFESSOR") {
      const turmaDisc = await prisma.turmaDisciplina.findUnique({ where: { id: faltaAtual.turmaDisciplinaId } });
      if (turmaDisc && turmaDisc.professorId !== usuarioIdLogado) {
        throw new Error("Não tem permissão para remover faltas nesta disciplina.");
      }
    }
    return FaltaRepository.delete(id);
  }
}
