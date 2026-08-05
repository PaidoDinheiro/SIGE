"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSituacaoFinanceiraAction } from "../actions/pagamento.actions";

interface Props {
  alunoId: number;
  anoLetivo: string;
}

export function SituacaoFinanceiraPage({ alunoId, anoLetivo }: Props) {
  const [situacao, setSituacao] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getSituacaoFinanceiraAction(alunoId, anoLetivo);
        setSituacao(data);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [alunoId, anoLetivo]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!situacao) return null;

  const estadoIcon = (estado: string) => {
    if (estado === "PAGO") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (estado === "ATRASADO") return <AlertTriangle className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-amber-400" />;
  };

  const estadoStyle = (estado: string) => {
    if (estado === "PAGO") return "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900";
    if (estado === "ATRASADO") return "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900";
    return "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Situação Financeira</h2>
        <p className="text-muted-foreground">
          {situacao.aluno.nome} — Ano Letivo: <strong>{situacao.anoLetivo}</strong>
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Meses Pagos</p>
            <p className="text-3xl font-bold text-emerald-600">{situacao.resumo.mesesPagosCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Meses em Atraso</p>
            <p className="text-3xl font-bold text-red-600">{situacao.resumo.mesesAtrasadosCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Total Pago</p>
            <p className="text-3xl font-bold">{situacao.resumo.totalPago.toFixed(0)} MT</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Total em Dívida</p>
            <p className="text-3xl font-bold text-red-600">{situacao.resumo.totalAtrasado.toFixed(0)} MT</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade de Meses */}
      <Card>
        <CardHeader>
          <CardTitle>Propinas Mensais — {situacao.anoLetivo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {situacao.meses.map((m: any) => (
              <div
                key={m.mesReferencia}
                className={`rounded-lg border p-4 transition-all ${estadoStyle(m.estado)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{m.nomeMes}</span>
                  {estadoIcon(m.estado)}
                </div>
                <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{m.estado}</p>
                {m.pagamento ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">{m.pagamento.dataPagamento}</p>
                    <p className="text-sm font-bold">{m.pagamento.valor.toFixed(2)} MT</p>
                    {m.pagamento.reciboNumero && (
                      <a
                        href={`/api/recibo?pagamentoId=${m.pagamento.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <Download className="h-3 w-3" />
                        {m.pagamento.reciboNumero}
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">—</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
