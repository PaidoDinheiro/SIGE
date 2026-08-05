import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { SituacaoFinanceiraPage } from "@/src/modules/financeiro/components/SituacaoFinanceiraPage";

export default async function EncarregadoFinanceiroPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Encontrar o primeiro educando associado ao encarregado pelo nome
  const educando = await prisma.aluno.findFirst({
    where: { nomeEncarregado: session.user.nome, deletedAt: null },
    include: { usuario: true },
  });

  if (!educando) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Nenhum educando associado ao seu perfil foi encontrado.
        </p>
      </div>
    );
  }

  const config = await prisma.configuracaoEscola.findFirst();
  const anoLetivo = config?.anoLetivoAtivo || String(new Date().getFullYear());

  return <SituacaoFinanceiraPage alunoId={educando.id} anoLetivo={anoLetivo} />;
}
