import { z } from "zod";

export const ProfessorTurmaSchema = z.object({
  id: z.number().optional(),
  turmaId: z.coerce.number().min(1, "Selecione a turma."),
  disciplinaId: z.coerce.number().min(1, "Selecione a disciplina."),
  professorId: z.coerce.number().min(1, "Selecione o professor."),
});

export type ProfessorTurmaInput = z.infer<typeof ProfessorTurmaSchema>;
