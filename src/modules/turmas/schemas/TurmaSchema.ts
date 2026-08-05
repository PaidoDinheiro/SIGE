import { z } from "zod";

export const TurmaSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(2, "O nome da turma é obrigatório.").max(100),
  anoLetivo: z.string().min(4, "Ano letivo inválido (ex: 2026).").max(9),
});

export type TurmaInput = z.infer<typeof TurmaSchema>;
