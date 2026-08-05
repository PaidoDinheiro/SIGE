import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { SituacaoFinanceiraPage } from "@/src/modules/financeiro/components/SituacaoFinanceiraPage";

export default async function AlunoFinanceiroPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: session.user.id, deletedAt: null },
  });

  if (!aluno) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Perfil de aluno não encontrado.</p>
      </div>
    );
  }

  const config = await prisma.configuracaoEscola.findFirst();
  const anoLetivo = config?.anoLetivoAtivo || String(new Date().getFullYear());

  return <SituacaoFinanceiraPage alunoId={aluno.id} anoLetivo={anoLetivo} />;
}
