import { prisma } from "@/src/lib/prisma";

export class DashboardService {
  static async getAdminMetrics() {
    const [totalAlunos, totalProfessores, totalTurmas, totalDisciplinas, config] = await Promise.all([
      prisma.aluno.count({ where: { deletedAt: null } }),
      prisma.usuario.count({ where: { tipoUsuario: "PROFESSOR", ativo: true, deletedAt: null } }),
      prisma.turma.count({ where: { deletedAt: null } }),
      prisma.disciplina.count({ where: { deletedAt: null } }),
      prisma.configuracaoEscola.findFirst(),
    ]);

    const anoLetivoAtivo = config?.anoLetivoAtivo || String(new Date().getFullYear());

    // Faturacao
    const pagamentos = await prisma.pagamento.findMany({
      where: { anoLetivo: anoLetivoAtivo, deletedAt: null },
    });

    const totalArrecadado = pagamentos
      .filter(p => p.status === "PAGO")
      .reduce((sum, p) => sum + Number(p.valor), 0);
      
    const propinasPendentes = pagamentos
      .filter(p => p.status === "PENDENTE" || p.status === "ATRASADO")
      .reduce((sum, p) => sum + Number(p.valor), 0);

    // Alunos por turma
    const turmas = await prisma.turma.findMany({
      where: { anoLetivo: anoLetivoAtivo, deletedAt: null },
      include: { _count: { select: { matriculas: { where: { status: "ATIVA", deletedAt: null } } } } },
    });
    const alunosPorTurma = turmas.map(t => ({ name: t.nome, alunos: t._count.matriculas }));

    // Receita por mes
    const mesesMap: Record<string, number> = {};
    pagamentos.filter(p => p.status === "PAGO").forEach(p => {
      mesesMap[p.mesReferencia] = (mesesMap[p.mesReferencia] || 0) + Number(p.valor);
    });
    const receitaPorMes = Object.keys(mesesMap).sort().map(m => ({ mes: m, valor: mesesMap[m] }));

    return {
      kpis: { totalAlunos, totalProfessores, totalTurmas, totalDisciplinas, totalArrecadado, propinasPendentes },
      charts: { alunosPorTurma, receitaPorMes },
      anoLetivo: anoLetivoAtivo,
    };
  }

  static async getProfessorMetrics(professorId: number) {
    const config = await prisma.configuracaoEscola.findFirst();
    const anoLetivo = config?.anoLetivoAtivo || String(new Date().getFullYear());

    const turmasDisciplinas = await prisma.turmaDisciplina.findMany({
      where: { professorId, deletedAt: null, turma: { anoLetivo, deletedAt: null } },
      include: {
        turma: true,
        disciplina: true,
        _count: { select: { notas: true, faltas: true } }
      }
    });

    const totalTurmas = new Set(turmasDisciplinas.map(td => td.turmaId)).size;
    const totalDisciplinas = new Set(turmasDisciplinas.map(td => td.disciplinaId)).size;
    const totalNotas = turmasDisciplinas.reduce((sum, td) => sum + td._count.notas, 0);
    const totalFaltas = turmasDisciplinas.reduce((sum, td) => sum + td._count.faltas, 0);

    const cargaHoraria = turmasDisciplinas.map(td => ({
      name: `${td.turma.nome} - ${td.disciplina.nome}`,
      notas: td._count.notas,
      faltas: td._count.faltas
    }));

    return {
      kpis: { totalTurmas, totalDisciplinas, totalNotas, totalFaltas },
      charts: { cargaHoraria },
      anoLetivo
    };
  }

  static async getAlunoMetrics(usuarioId: number) {
    const config = await prisma.configuracaoEscola.findFirst();
    const anoLetivo = config?.anoLetivoAtivo || String(new Date().getFullYear());

    const aluno = await prisma.aluno.findUnique({
      where: { usuarioId, deletedAt: null },
      include: {
        faltas: { where: { matricula: { anoLetivo } } },
        notas: { where: { anoLetivo }, include: { disciplina: true } },
        pagamentos: { where: { anoLetivo, deletedAt: null } }
      }
    });

    if (!aluno) throw new Error("Aluno não encontrado");

    const totalFaltas = aluno.faltas.length;
    const faltasInjustificadas = aluno.faltas.filter(f => f.tipo === "INJUSTIFICADA").length;
    
    let mediaGeral = 0;
    if (aluno.notas.length > 0) {
      mediaGeral = aluno.notas.reduce((sum, n) => sum + Number(n.media), 0) / aluno.notas.length;
    }

    const mesesAtrasados = aluno.pagamentos.filter(p => p.status === "ATRASADO").length;

    const desempenhoPorDisciplina = aluno.notas.map(n => ({
      disciplina: n.disciplina.nome,
      trimestre: n.trimestre,
      media: Number(n.media)
    }));

    return {
      kpis: { totalFaltas, faltasInjustificadas, mediaGeral, mesesAtrasados },
      charts: { desempenhoPorDisciplina },
      anoLetivo,
      alunoNome: aluno.nomeEncarregado // just a placeholder
    };
  }

  static async getTesourariaMetrics() {
    const config = await prisma.configuracaoEscola.findFirst();
    const anoLetivo = config?.anoLetivoAtivo || String(new Date().getFullYear());

    const pagamentos = await prisma.pagamento.findMany({
      where: { anoLetivo, deletedAt: null },
    });

    const receitaAnual = pagamentos.filter(p => p.status === "PAGO").reduce((s, p) => s + Number(p.valor), 0);
    const propinasAtrasadas = pagamentos.filter(p => p.status === "ATRASADO").reduce((s, p) => s + Number(p.valor), 0);
    const qtdAtrasados = pagamentos.filter(p => p.status === "ATRASADO").length;

    const metodos = { CAIXA: 0, TRANSFERENCIA: 0, DEPOSITO: 0 };
    pagamentos.filter(p => p.status === "PAGO" && p.metodoPagamento).forEach(p => {
      if (p.metodoPagamento) metodos[p.metodoPagamento] += Number(p.valor);
    });

    const receitaPorMetodo = [
      { name: "Caixa", value: metodos.CAIXA },
      { name: "Transferência", value: metodos.TRANSFERENCIA },
      { name: "Depósito", value: metodos.DEPOSITO }
    ];

    return {
      kpis: { receitaAnual, propinasAtrasadas, qtdAtrasados },
      charts: { receitaPorMetodo },
      anoLetivo
    };
  }

  static async getSecretariaMetrics() {
    const config = await prisma.configuracaoEscola.findFirst();
    const anoLetivo = config?.anoLetivoAtivo || String(new Date().getFullYear());

    const [totalAlunos, turmasAtivas, matriculasAtivas] = await Promise.all([
      prisma.aluno.count({ where: { deletedAt: null } }),
      prisma.turma.count({ where: { anoLetivo, deletedAt: null } }),
      prisma.matricula.count({ where: { anoLetivo, status: "ATIVA", deletedAt: null } })
    ]);

    return {
      kpis: { totalAlunos, turmasAtivas, matriculasAtivas },
      anoLetivo
    };
  }
}
