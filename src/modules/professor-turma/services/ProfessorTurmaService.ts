import { prisma } from "@/src/lib/prisma";
import { ProfessorTurmaRepository } from "../repositories/ProfessorTurmaRepository";
import { ProfessorTurmaInput, ProfessorTurmaSchema } from "../schemas/ProfessorTurmaSchema";

export class ProfessorTurmaService {
  
  static async getAssociacoes(query?: string) {
    return ProfessorTurmaRepository.findMany(query);
  }

  static async getAssociacaoById(id: number) {
    const assoc = await ProfessorTurmaRepository.findById(id);
    if (!assoc) throw new Error("Associação não encontrada.");
    return assoc;
  }

  static async createAssociacao(data: ProfessorTurmaInput) {
    const result = ProfessorTurmaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    // A constraint @@unique([turmaId, disciplinaId]) impede que uma turma tenha a mesma disciplina mais de uma vez.
    const assocExiste = await prisma.turmaDisciplina.findFirst({
      where: { 
        turmaId: validatedData.turmaId, 
        disciplinaId: validatedData.disciplinaId, 
        deletedAt: null 
      }
    });
    if (assocExiste) {
      throw new Error("Esta turma já possui esta disciplina alocada (com o mesmo ou outro professor).");
    }

    // Validações de existência e deletedAt
    const turma = await prisma.turma.findUnique({ where: { id: validatedData.turmaId, deletedAt: null } });
    if (!turma) throw new Error("Turma inválida ou arquivada.");

    const disciplina = await prisma.disciplina.findUnique({ where: { id: validatedData.disciplinaId, deletedAt: null } });
    if (!disciplina) throw new Error("Disciplina inválida ou arquivada.");

    const professor = await prisma.usuario.findFirst({ 
      where: { id: validatedData.professorId, tipoUsuario: "PROFESSOR", deletedAt: null } 
    });
    if (!professor) throw new Error("Professor inválido, não é do tipo PROFESSOR, ou foi arquivado.");

    return ProfessorTurmaRepository.create({
      turmaId: validatedData.turmaId,
      disciplinaId: validatedData.disciplinaId,
      professorId: validatedData.professorId,
    });
  }

  static async updateAssociacao(id: number, data: ProfessorTurmaInput) {
    const result = ProfessorTurmaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const assocAtual = await this.getAssociacaoById(id);

    if (validatedData.turmaId !== assocAtual.turmaId || validatedData.disciplinaId !== assocAtual.disciplinaId) {
      const assocExiste = await prisma.turmaDisciplina.findFirst({
        where: { 
          turmaId: validatedData.turmaId, 
          disciplinaId: validatedData.disciplinaId, 
          deletedAt: null 
        }
      });
      if (assocExiste) {
        throw new Error("Esta turma já possui esta disciplina alocada.");
      }
    }

    return ProfessorTurmaRepository.update(id, {
      turmaId: validatedData.turmaId,
      disciplinaId: validatedData.disciplinaId,
      professorId: validatedData.professorId,
    });
  }

  static async deleteAssociacao(id: number) {
    await this.getAssociacaoById(id);
    return ProfessorTurmaRepository.softDelete(id);
  }
}
