import { z } from "zod";

export const AvisoSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(150, "O título não pode ter mais de 150 caracteres"),
  conteudo: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
});

export type AvisoInput = z.infer<typeof AvisoSchema>;
