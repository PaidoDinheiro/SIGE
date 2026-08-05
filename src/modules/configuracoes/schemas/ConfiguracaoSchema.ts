import { z } from "zod";

export const ConfiguracaoEscolaSchema = z.object({
  nome: z.string().min(3, "O nome da escola deve ter pelo menos 3 caracteres.").max(200),
  endereco: z.string().max(255).optional().or(z.literal("")),
  telefone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Endereço de e-mail inválido.").max(150).optional().or(z.literal("")),
  website: z.string().url("URL inválido.").max(150).optional().or(z.literal("")),
  diretor: z.string().min(3, "O nome do diretor é obrigatório.").max(150),
  anoLetivoAtivo: z.string().regex(/^\d{4}$/, "O ano letivo deve ter 4 dígitos (ex: 2026)."),
  numeroTrimestres: z.coerce.number().int().min(1, "O número de trimestres deve ser pelo menos 1.").max(4, "O número máximo de trimestres é 4."),
  notaMinimaAprovacao: z.coerce.number().min(0).max(20, "A nota mínima não pode ser superior a 20."),
  valorPropina: z.coerce.number().min(0, "O valor da propina não pode ser negativo."),
  banco: z.string().max(100).optional().or(z.literal("")),
  contaBancaria: z.string().max(50).optional().or(z.literal("")),
  nib: z.string().max(50).optional().or(z.literal("")),
});

export type ConfiguracaoEscolaInput = z.infer<typeof ConfiguracaoEscolaSchema>;
