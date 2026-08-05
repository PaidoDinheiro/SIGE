import { prisma } from "@/src/lib/prisma";
import { NotaRepository } from "../repositories/NotaRepository";
import { NotaInput, NotaSchema } from "../schemas/NotaSchema";
import { SituacaoNota } from "@/src/generated/prisma/client";

export class NotaService {
  
  // Função centralizada e reutilizável solicitada pelo utilizador
  static calcularMediaESituacao(acs1: number, acs2: number, acp: number): { media: number, situacao: SituacaoNota } {
    const media = (acs1 + acs2 + acp) / 3;
    const mediaArredondada = parseFloat(media.toFixed(2));
    const situacao = mediaArredondada >= 10 ? "APROVADO" : "REPROVADO";
    return { media: mediaArredondada, situacao };
  }

  static async getNotas(query?: string) {
    return NotaRepository.findMany(query);
  }

  static async getNotaById(id: number) {
    const nota = await NotaRepository.findById(id);
    if (!nota) throw new Error("Nota não encontrada.");
    return nota;
  }

  static async createNota(data: NotaInput, usuarioIdLogado: number, tipoUsuarioLogado: string) {
    const result = NotaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;

    const turmaDisc = await prisma.turmaDisciplina.findUnique({ where: { id: validatedData.turmaDisciplinaId } });
    if (!turmaDisc) throw new Error("Associação Turma/Disciplina não existe.");

    // Se for PROFESSOR, só pode lançar se for a turma/disciplina dele
    if (tipoUsuarioLogado === "PROFESSOR") {
      if (turmaDisc.professorId !== usuarioIdLogado) {
        throw new Error("Não tem permissão para lançar notas nesta disciplina, pois está alocada a outro professor.");
      }
    }

    // A constraint @@unique([alunoId, turmaDisciplinaId, trimestre, anoLetivo]) será testada
    const notaExiste = await prisma.nota.findFirst({
      where: { 
        alunoId: validatedData.alunoId, 
        turmaDisciplinaId: validatedData.turmaDisciplinaId, 
        trimestre: validatedData.trimestre, 
        anoLetivo: validatedData.anoLetivo 
      }
    });
    if (notaExiste) {
      throw new Error("Já existe um lançamento de notas para este aluno nesta disciplina e trimestre.");
    }

    const calculo = this.calcularMediaESituacao(validatedData.acs1, validatedData.acs2, validatedData.acp);

    return NotaRepository.create({
      alunoId: validatedData.alunoId,
      matriculaId: validatedData.matriculaId,
      turmaDisciplinaId: validatedData.turmaDisciplinaId,
      disciplinaId: turmaDisc.disciplinaId,
      trimestre: validatedData.trimestre,
      anoLetivo: validatedData.anoLetivo,
      acs1: validatedData.acs1,
      acs2: validatedData.acs2,
      acp: validatedData.acp,
      media: calculo.media,
      situacao: calculo.situacao,
    });
  }

  static async updateNota(id: number, data: NotaInput, usuarioIdLogado: number, tipoUsuarioLogado: string) {
    const result = NotaSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues.map((e: any) => e.message).join(", "));
    }
    const validatedData = result.data;
    
    const notaAtual = await this.getNotaById(id);

    // Validação PROFESSOR
    if (tipoUsuarioLogado === "PROFESSOR") {
      const turmaDisc = await prisma.turmaDisciplina.findUnique({ where: { id: notaAtual.turmaDisciplinaId } });
      if (turmaDisc && turmaDisc.professorId !== usuarioIdLogado) {
        throw new Error("Não tem permissão para alterar notas nesta disciplina.");
      }
    }

    const calculo = this.calcularMediaESituacao(validatedData.acs1, validatedData.acs2, validatedData.acp);

    return NotaRepository.update(id, {
      acs1: validatedData.acs1,
      acs2: validatedData.acs2,
      acp: validatedData.acp,
      media: calculo.media,
      situacao: calculo.situacao,
    });
  }
}
