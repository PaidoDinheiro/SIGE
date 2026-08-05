import { z } from "zod";

export const DisciplinaSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(2, "O nome da disciplina é obrigatório.").max(100),
});

export type DisciplinaInput = z.infer<typeof DisciplinaSchema>;
