import { prisma } from "@/src/lib/prisma";
import { PagamentoRepository } from "../repositories/PagamentoRepository";
import { PagamentoInput } from "../schemas/PagamentoSchema";
import { ReciboService } from "./ReciboService";

export class PagamentoService {
  
  static async getPagamentos(filters: any) {
    return PagamentoRepository.findMany(filters);
  }

  static async getPagamentoById(id: number) {
    const pay = await PagamentoRepository.findById(id);
    if (!pay) throw new Error("Pagamento não encontrado.");
    return pay;
  }

  static async registrarPagamento(data: PagamentoInput, responsavelId: number) {
    // A validação Zod e o controle de duplicado atómico ocorrem dentro do ReciboService
    return ReciboService.criarPagamentoERecibo(data, responsavelId);
  }

  static async cancelarPagamento(id: number) {
    await this.getPagamentoById(id);
    return PagamentoRepository.softDelete(id);
  }

  static async getSituacaoFinanceira(alunoId: number, anoLetivo: string) {
    // 1. Validar se o aluno existe e está matriculado
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId, deletedAt: null },
      include: { usuario: true }
    });
    if (!aluno) throw new Error("Aluno não encontrado.");

    // 2. Obter todos os pagamentos ativos do aluno neste ano letivo
    const pagamentos = await prisma.pagamento.findMany({
      where: {
        alunoId,
        anoLetivo,
        deletedAt: null,
      },
      include: {
        recibo: true
      }
    });

    // 3. Montar a lista fixa dos 12 meses do ano letivo (formato YYYY-MM)
    const mesesNomes = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth(); // 0 a 11

    const situacaoMeses = mesesNomes.map((nome, index) => {
      const monthNum = String(index + 1).padStart(2, "0");
      const mesReferencia = `${anoLetivo}-${monthNum}`;

      // Tenta encontrar o pagamento correspondente
      const pagamento = pagamentos.find(p => p.mesReferencia === mesReferencia);

      let estado: "PAGO" | "PENDENTE" | "ATRASADO" = "PENDENTE";
      
      if (pagamento) {
        estado = "PAGO";
      } else {
        // Determina se o mês de referência já passou
        const refYear = parseInt(anoLetivo, 10);
        const refMonthIndex = index;

        if (refYear < currentYear) {
          estado = "ATRASADO";
        } else if (refYear === currentYear) {
          if (refMonthIndex < currentMonthIndex) {
            estado = "ATRASADO";
          }
        }
      }

      return {
        mesReferencia,
        nomeMes: nome,
        estado,
        pagamento: pagamento ? {
          id: pagamento.id,
          valor: Number(pagamento.valor),
          dataPagamento: pagamento.dataPagamento?.toLocaleDateString("pt-MZ"),
          metodoPagamento: pagamento.metodoPagamento,
          reciboNumero: pagamento.recibo?.numero,
        } : null
      };
    });

    // Calcular resumo
    const totalPago = pagamentos.reduce((sum, p) => sum + Number(p.valor), 0);
    const totalAtrasado = situacaoMeses.filter(m => m.estado === "ATRASADO").length * 1200; // Propina base: 1200

    return {
      aluno: {
        id: aluno.id,
        nome: aluno.usuario.nome,
        numeroBI: aluno.numeroBI,
      },
      anoLetivo,
      meses: situacaoMeses,
      resumo: {
        totalPago,
        totalAtrasado,
        mesesPagosCount: pagamentos.length,
        mesesAtrasadosCount: situacaoMeses.filter(m => m.estado === "ATRASADO").length
      }
    };
  }
}
