import { prisma } from "@/src/lib/prisma";
import { PagamentoInput } from "../schemas/PagamentoSchema";

export class ReciboService {
  
  private static async generateReciboNumber(tx: any, year: number): Promise<string> {
    // Busca o recibo com o ID mais alto do ano civil corrente
    const latestRecibo = await tx.recibo.findFirst({
      where: {
        numero: {
          startsWith: `REC-${year}-`,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    let nextSequence = 1;
    if (latestRecibo) {
      const parts = latestRecibo.numero.split("-");
      if (parts.length === 3) {
        const currentSeq = parseInt(parts[2], 10);
        if (!isNaN(currentSeq)) {
          nextSequence = currentSeq + 1;
        }
      }
    }

    const paddedSeq = String(nextSequence).padStart(6, "0");
    return `REC-${year}-${paddedSeq}`;
  }

  static async criarPagamentoERecibo(data: PagamentoInput, responsavelId: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Validar duplicado ativo
      const activePay = await tx.pagamento.findFirst({
        where: {
          alunoId: data.alunoId,
          mesReferencia: data.mesReferencia,
          deletedAt: null,
        },
      });
      if (activePay) {
        throw new Error("Já existe um pagamento ativo para este aluno no mês selecionado.");
      }

      // 2. Obter número sequencial atómico
      const year = new Date().getFullYear();
      const numeroRecibo = await this.generateReciboNumber(tx, year);

      // 3. Criar Pagamento
      const pagamento = await tx.pagamento.create({
        data: {
          alunoId: data.alunoId,
          mesReferencia: data.mesReferencia,
          anoLetivo: data.anoLetivo,
          valor: data.valor,
          status: "PAGO",
          metodoPagamento: data.metodoPagamento,
          dataPagamento: new Date(),
          referenciaPagamento: data.referenciaPagamento || null,
          observacao: data.observacao || null,
          responsavelId,
        },
      });

      // 4. Criar Recibo
      const recibo = await tx.recibo.create({
        data: {
          pagamentoId: pagamento.id,
          numero: numeroRecibo,
          emitidoEm: new Date(),
        },
      });

      return { pagamento, recibo };
    });
  }
}
