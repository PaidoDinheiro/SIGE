import React from "react";
import { pdf } from "@react-pdf/renderer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { ReciboPDF } from "@/src/modules/financeiro/components/ReciboPDF";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response("Não autorizado.", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pagamentoId = parseInt(searchParams.get("pagamentoId") || "0");

    if (!pagamentoId) {
      return new Response("Parâmetro pagamentoId é obrigatório.", { status: 400 });
    }

    const role = session.user.tipoUsuario;

    // Buscar pagamento com recibo associado
    const pagamento = await prisma.pagamento.findFirst({
      where: { id: pagamentoId, deletedAt: null },
      include: {
        aluno: { include: { usuario: true } },
        recibo: true,
        responsavel: true,
      },
    });

    if (!pagamento || !pagamento.recibo) {
      return new Response("Pagamento ou Recibo não encontrado.", { status: 404 });
    }

    // RBAC: Aluno só pode aceder ao próprio recibo
    if (role === "ALUNO") {
      const aluno = await prisma.aluno.findUnique({ where: { usuarioId: session.user.id } });
      if (!aluno || aluno.id !== pagamento.alunoId) {
        return new Response("Acesso negado.", { status: 403 });
      }
    }

    // RBAC: Encarregado só acede ao recibo dos seus educandos
    if (role === "ENCARREGADO") {
      if (pagamento.aluno.nomeEncarregado !== session.user.nome) {
        return new Response("Acesso negado.", { status: 403 });
      }
    }

    // RBAC: Professor não tem acesso
    if (role === "PROFESSOR") {
      return new Response("Acesso negado.", { status: 403 });
    }

    const escola = await prisma.configuracaoEscola.findFirst();

    const pdfData = {
      escola: {
        nome: escola?.nome || "Escola Da Catedral",
        endereco: escola?.endereco || "Beira, Moçambique",
        diretor: escola?.diretor || "Diretor Geral",
      },
      recibo: {
        numero: pagamento.recibo.numero,
        emitidoEm: pagamento.recibo.emitidoEm.toLocaleDateString("pt-MZ"),
      },
      aluno: {
        nome: pagamento.aluno.usuario.nome,
        numeroBI: pagamento.aluno.numeroBI,
      },
      pagamento: {
        mesReferencia: pagamento.mesReferencia,
        anoLetivo: pagamento.anoLetivo ?? "",
        valor: Number(pagamento.valor),
        metodoPagamento: pagamento.metodoPagamento ?? "CAIXA",
        referenciaPagamento: pagamento.referenciaPagamento,
        dataPagamento: pagamento.dataPagamento?.toLocaleDateString("pt-MZ") || "-",
        observacao: pagamento.observacao,
      },
      operador: pagamento.responsavel?.nome ?? "Sistema",
    };

    const doc = <ReciboPDF data={pdfData} />;
    const buffer = await pdf(doc).toBuffer();

    return new Response(buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Recibo_${pagamento.recibo.numero}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erro na geração do recibo:", error);
    return new Response(error.message || "Erro interno do servidor.", { status: 500 });
  }
}
