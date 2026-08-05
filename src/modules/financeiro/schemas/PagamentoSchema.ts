import { z } from "zod";

export const PagamentoSchema = z.object({
  id: z.number().optional(),
  alunoId: z.coerce.number().min(1, "Selecione o aluno."),
  mesReferencia: z.string().regex(/^\d{4}-\d{2}$/, "O mês de referência deve estar no formato AAAA-MM."),
  anoLetivo: z.string().min(4, "Ano letivo inválido."),
  valor: z.coerce.number().min(0, "O valor deve ser maior ou igual a 0."),
  metodoPagamento: z.enum(["CAIXA", "TRANSFERENCIA", "DEPOSITO"]),
  referenciaPagamento: z.string().max(100).optional().or(z.literal("")),
  observacao: z.string().max(255).optional().or(z.literal("")),
});

export type PagamentoInput = z.infer<typeof PagamentoSchema>;
