import { z } from "zod";

export const NotaSchema = z.object({
  id: z.number().optional(),
  alunoId: z.coerce.number().min(1, "Selecione o aluno."),
  matriculaId: z.coerce.number().min(1, "Selecione a matrícula ativa."),
  turmaDisciplinaId: z.coerce.number().min(1, "Selecione a disciplina/turma."),
  trimestre: z.coerce.number().min(1).max(3),
  anoLetivo: z.string().min(4).max(9),
  
  acs1: z.coerce.number().min(0, "A nota não pode ser inferior a 0.").max(20, "A nota não pode ser superior a 20."),
  acs2: z.coerce.number().min(0, "A nota não pode ser inferior a 0.").max(20, "A nota não pode ser superior a 20."),
  acp: z.coerce.number().min(0, "A nota não pode ser inferior a 0.").max(20, "A nota não pode ser superior a 20."),
});

export type NotaInput = z.infer<typeof NotaSchema>;
