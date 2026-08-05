import { z } from "zod";

export const EncarregadoSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").max(150),
  email: z.string().email("Endereço de e-mail inválido.").max(150),
  senha: z.string().min(6, "A palavra-passe deve ter no mínimo 6 caracteres.").optional().or(z.literal("")),
  ativo: z.boolean().default(true),
});

export type EncarregadoInput = z.infer<typeof EncarregadoSchema>;
