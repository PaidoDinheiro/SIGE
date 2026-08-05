import { z } from "zod";

export const FaltaSchema = z.object({
  id: z.number().optional(),
  alunoId: z.coerce.number().min(1, "Selecione o aluno."),
  matriculaId: z.coerce.number().min(1, "Selecione a matrícula ativa."),
  turmaDisciplinaId: z.coerce.number().min(1, "Selecione a disciplina/turma."),
  data: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data inválida.",
  }),
  tipo: z.enum(["JUSTIFICADA", "INJUSTIFICADA"]),
  observacao: z.string().max(255).optional(),
});

export type FaltaInput = z.infer<typeof FaltaSchema>;
