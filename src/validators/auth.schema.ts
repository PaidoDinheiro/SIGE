import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é de preenchimento obrigatório.")
    .email("Por favor, insira um endereço de e-mail válido."),
  password: z
    .string()
    .min(1, "A palavra-passe é de preenchimento obrigatório.")
    .min(6, "A palavra-passe deve ter pelo menos 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;
