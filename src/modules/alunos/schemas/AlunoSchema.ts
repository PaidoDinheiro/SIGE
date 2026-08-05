import { z } from "zod";

export const AlunoSchema = z.object({
  id: z.number().optional(),
  
  // Dados do Utilizador (Usuario)
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").max(150),
  email: z.string().email("Endereço de e-mail inválido.").max(150),
  senha: z.string().min(6, "A palavra-passe deve ter no mínimo 6 caracteres.").optional().or(z.literal("")),
  
  // Dados do Aluno
  numeroBI: z.string().min(5, "O número de BI/Documento deve ter pelo menos 5 caracteres.").max(30),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida (AAAA-MM-DD)."),
  contacto: z.string().max(30).optional().or(z.literal("")),
  nomeEncarregado: z.string().min(3, "O nome do encarregado é obrigatório.").max(150),
  contactoEncarregado: z.string().max(30).optional().or(z.literal("")),
});

export type AlunoInput = z.infer<typeof AlunoSchema>;
