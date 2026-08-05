import { prisma } from "@/src/lib/prisma";
import { PagamentoService } from "./PagamentoService";
import { MetodoPagamento } from "@/src/generated/prisma/client";

export class RelatorioService {
  
  static async getRelatorioArrecadacao(filters: {
    dataInicio?: Date;
    dataFim?: Date;
    mesReferencia?: string;
    anoLetivo?: string;
    metodoPagamento?: MetodoPagamento;
  }) {
    // 1. Buscar todos os pagamentos com base nos filtros
    const pagamentos = await PagamentoService.getPagamentos({
      ...filters,
    });

    // 2. Agrupar somatórios
    const totalArrecadado = pagamentos.reduce((sum, p) => sum + Number(p.valor), 0);
    const totalRegistos = pagamentos.length;

    // 3. Somatórios por método de pagamento
    const porMetodo = {
      CAIXA: pagamentos.filter(p => p.metodoPagamento === "CAIXA").reduce((sum, p) => sum + Number(p.valor), 0),
      TRANSFERENCIA: pagamentos.filter(p => p.metodoPagamento === "TRANSFERENCIA").reduce((sum, p) => sum + Number(p.valor), 0),
      DEPOSITO: pagamentos.filter(p => p.metodoPagamento === "DEPOSITO").reduce((sum, p) => sum + Number(p.valor), 0),
    };

    return {
      totalArrecadado,
      totalRegistos,
      porMetodo,
      pagamentos: pagamentos.map(p => ({
        id: p.id,
        alunoNome: p.aluno.usuario.nome,
        mesReferencia: p.mesReferencia,
        anoLetivo: p.anoLetivo,
        valor: Number(p.valor),
        metodoPagamento: p.metodoPagamento,
        dataPagamento: p.dataPagamento?.toLocaleDateString("pt-MZ"),
        reciboNumero: p.recibo?.numero,
      }))
    };
  }

  static async getRelatorioInadimplencia(anoLetivo: string) {
    // 1. Obter todas as matrículas ativas no ano letivo
    const matriculas = await prisma.matricula.findMany({
      where: {
        anoLetivo,
        status: "ATIVA",
        deletedAt: null
      },
      include: {
        aluno: {
          include: {
            usuario: true
          }
        }
      }
    });

    const devedores = [];

    // 2. Para cada aluno matriculado, calcular a sua situação de atraso
    for (const mat of matriculas) {
      const situacao = await PagamentoService.getSituacaoFinanceira(mat.alunoId, anoLetivo);
      
      if (situacao.resumo.mesesAtrasadosCount > 0) {
        // Encontra quais são os meses específicos em atraso
        const mesesAtrasados = situacao.meses
          .filter(m => m.estado === "ATRASADO")
          .map(m => m.nomeMes);

        devedores.push({
          alunoId: mat.alunoId,
          nome: mat.aluno.usuario.nome,
          numeroBI: mat.aluno.numeroBI,
          mesesAtrasados,
          totalAtrasado: situacao.resumo.totalAtrasado,
          quantidadeMeses: situacao.resumo.mesesAtrasadosCount
        });
      }
    }

    // Ordenar devedores por quantidade de meses em atraso (decrescente)
    devedores.sort((a, b) => b.quantidadeMeses - a.quantidadeMeses);

    return {
      anoLetivo,
      totalDevedores: devedores.length,
      totalValorInadimplente: devedores.reduce((sum, d) => sum + d.totalAtrasado, 0),
      devedores
    };
  }
}
