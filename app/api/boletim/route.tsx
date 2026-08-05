import React from "react";
import { pdf } from "@react-pdf/renderer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { BoletimService } from "@/src/modules/boletins/services/BoletimService";
import { BoletimPDF } from "@/src/modules/boletins/components/BoletimPDF";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const trimestre = parseInt(searchParams.get("trimestre") || "1");
    const anoLetivo = searchParams.get("anoLetivo") || new Date().getFullYear().toString();
    let alunoId = parseInt(searchParams.get("alunoId") || "0");

    const role = session.user.tipoUsuario;

    // Se for Aluno, força o próprio alunoId
    if (role === "ALUNO") {
      const aluno = await prisma.aluno.findUnique({
        where: { usuarioId: session.user.id },
      });
      if (!aluno) {
        return new Response("Perfil de aluno não encontrado.", { status: 404 });
      }
      alunoId = aluno.id;
    }

    // Se for Encarregado, verifica se o aluno correspondente está associado ao nome dele
    if (role === "ENCARREGADO") {
      if (!alunoId) {
        // Tenta encontrar o primeiro educando associado a este Encarregado
        const aluno = await prisma.aluno.findFirst({
          where: { nomeEncarregado: session.user.nome },
        });
        if (!aluno) {
          return new Response("Nenhum educando associado ao seu nome foi encontrado.", { status: 404 });
        }
        alunoId = aluno.id;
      } else {
        // Valida se o aluno selecionado tem este encarregado
        const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });
        if (!aluno || aluno.nomeEncarregado !== session.user.nome) {
          return new Response("Não tem permissão para ver o boletim deste aluno.", { status: 403 });
        }
      }
    }

    // Validações adicionais para PROFESSOR e TESOURARIA
    if (role === "TESOURARIA") {
      return new Response("Acesso negado.", { status: 403 });
    }

    if (role === "PROFESSOR") {
      // Professor só pode ver boletim se ensinar alguma disciplina na turma do aluno
      const alunoMatricula = await prisma.matricula.findFirst({
        where: { alunoId, status: "ATIVA", deletedAt: null },
      });
      if (alunoMatricula) {
        const associacaoProf = await prisma.turmaDisciplina.findFirst({
          where: {
            turmaId: alunoMatricula.turmaId,
            professorId: session.user.id,
            deletedAt: null,
          },
        });
        if (!associacaoProf) {
          return new Response("Não leciona na turma deste aluno.", { status: 403 });
        }
      } else {
        return new Response("Aluno não matriculado.", { status: 404 });
      }
    }

    if (!alunoId) {
      return new Response("Aluno não especificado.", { status: 400 });
    }

    // Buscar dados do boletim
    const data = await BoletimService.getBoletimData(alunoId, trimestre, anoLetivo);

    // Gerar o PDF usando @react-pdf/renderer
    const doc = <BoletimPDF data={data} />;
    const buffer = await pdf(doc).toBuffer();

    return new Response(buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Boletim_${data.aluno.nome.replace(/\s+/g, "_")}_Trimestre_${trimestre}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erro na geração do boletim:", error);
    return new Response(error.message || "Erro interno do servidor", { status: 500 });
  }
}
