import { z } from "zod";

export const MatriculaSchema = z.object({
  id: z.number().optional(),
  alunoId: z.coerce.number().min(1, "Selecione o aluno."),
  turmaId: z.coerce.number().min(1, "Selecione a turma."),
  anoLetivo: z.string().min(4, "Ano letivo inválido.").max(9),
  status: z.enum(["ATIVA", "TRANSFERIDA", "CONCLUIDA", "CANCELADA"]).default("ATIVA"),
});

export type MatriculaInput = z.infer<typeof MatriculaSchema>;
