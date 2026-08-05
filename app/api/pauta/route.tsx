import React from "react";
import { pdf } from "@react-pdf/renderer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { PautaService } from "@/src/modules/pautas/services/PautaService";
import { PautaPDF } from "@/src/modules/pautas/components/PautaPDF";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const turmaId = parseInt(searchParams.get("turmaId") || "0");
    const disciplinaId = parseInt(searchParams.get("disciplinaId") || "0");
    const trimestre = parseInt(searchParams.get("trimestre") || "1");
    const anoLetivo = searchParams.get("anoLetivo") || new Date().getFullYear().toString();

    const role = session.user.tipoUsuario;

    // Apenas ADMIN e SECRETARIA podem emitir pautas.
    // Aluno e Encarregado não têm acesso a pautas completas da turma.
    if (role !== "ADMIN" && role !== "SECRETARIA") {
      return new Response("Acesso negado. Apenas Admin e Secretaria podem emitir pautas.", { status: 403 });
    }

    if (!turmaId || !disciplinaId) {
      return new Response("Parâmetros turmaId e disciplinaId são obrigatórios.", { status: 400 });
    }

    // Buscar dados da pauta
    const data = await PautaService.getPautaData(turmaId, disciplinaId, trimestre, anoLetivo);

    // Gerar o PDF usando @react-pdf/renderer
    const doc = <PautaPDF data={data} />;
    const buffer = await pdf(doc).toBuffer();

    return new Response(buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Pauta_${data.turma.replace(/\s+/g, "_")}_${data.disciplina.replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erro na geração da pauta:", error);
    return new Response(error.message || "Erro interno do servidor", { status: 500 });
  }
}
