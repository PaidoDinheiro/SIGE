"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getRelatorioArrecadacaoAction,
  getRelatorioInadimplenciaAction,
} from "../actions/relatorio.actions";

export function RelatoriosPage() {
  const [tab, setTab] = useState<"arrecadacao" | "inadimplencia">("arrecadacao");
  const [isLoading, setIsLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<any>(null);

  // Filtros de arrecadação
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mesReferencia, setMesReferencia] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("");

  // Filtros de inadimplência
  const [anoLetivo, setAnoLetivo] = useState(String(new Date().getFullYear()));

  const handleArrecadacao = async () => {
    try {
      setIsLoading(true);
      const data = await getRelatorioArrecadacaoAction({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        mesReferencia: mesReferencia || undefined,
        metodoPagamento: metodoPagamento || undefined,
      });
      setRelatorio({ tipo: "arrecadacao", ...data });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInadimplencia = async () => {
    try {
      setIsLoading(true);
      const data = await getRelatorioInadimplenciaAction(anoLetivo);
      setRelatorio({ tipo: "inadimplencia", ...data });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h2>
        <p className="text-muted-foreground">Análise de arrecadação e devedores.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            tab === "arrecadacao"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => { setTab("arrecadacao"); setRelatorio(null); }}
        >
          <TrendingUp className="inline h-4 w-4 mr-1" />
          Arrecadação
        </button>
        <button
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            tab === "inadimplencia"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => { setTab("inadimplencia"); setRelatorio(null); }}
        >
          <Users className="inline h-4 w-4 mr-1" />
          Inadimplência
        </button>
      </div>

      {/* Filtros de Arrecadação */}
      {tab === "arrecadacao" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Filtros de Arrecadação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Data Início</label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Data Fim</label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Mês de Referência</label>
                <Input type="month" value={mesReferencia} onChange={(e) => setMesReferencia(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Método</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="CAIXA">Caixa</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="DEPOSITO">Depósito</option>
                </select>
              </div>
            </div>
            <Button onClick={handleArrecadacao} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filtros de Inadimplência */}
      {tab === "inadimplencia" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Filtros de Inadimplência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end mb-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Ano Letivo</label>
                <Input
                  placeholder="ex: 2026"
                  value={anoLetivo}
                  onChange={(e) => setAnoLetivo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={handleInadimplencia} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Gerar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados de Arrecadação */}
      {relatorio?.tipo === "arrecadacao" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Total Arrecadado</p>
                <p className="text-2xl font-bold text-emerald-600">{relatorio.totalArrecadado.toFixed(2)} MT</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Registos</p>
                <p className="text-2xl font-bold">{relatorio.totalRegistos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Caixa</p>
                <p className="text-2xl font-bold">{relatorio.porMetodo.CAIXA.toFixed(2)} MT</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Transferência + Depósito</p>
                <p className="text-2xl font-bold">
                  {(relatorio.porMetodo.TRANSFERENCIA + relatorio.porMetodo.DEPOSITO).toFixed(2)} MT
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Lista de Pagamentos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Aluno</th>
                      <th className="py-3 px-4 text-left font-medium">Mês</th>
                      <th className="py-3 px-4 text-left font-medium">Valor</th>
                      <th className="py-3 px-4 text-left font-medium">Método</th>
                      <th className="py-3 px-4 text-left font-medium">Data</th>
                      <th className="py-3 px-4 text-left font-medium">Recibo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {relatorio.pagamentos.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{p.alunoNome}</td>
                        <td className="py-3 px-4">{p.mesReferencia}</td>
                        <td className="py-3 px-4">{p.valor.toFixed(2)} MT</td>
                        <td className="py-3 px-4">{p.metodoPagamento}</td>
                        <td className="py-3 px-4">{p.dataPagamento}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{p.reciboNumero || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resultados de Inadimplência */}
      {relatorio?.tipo === "inadimplencia" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Total de Devedores</p>
                <p className="text-3xl font-bold text-red-600">{relatorio.totalDevedores}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Total em Dívida</p>
                <p className="text-3xl font-bold text-red-600">{relatorio.totalValorInadimplente.toFixed(2)} MT</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Lista de Devedores — {relatorio.anoLetivo}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Aluno</th>
                      <th className="py-3 px-4 text-left font-medium">BI</th>
                      <th className="py-3 px-4 text-left font-medium">Meses em Atraso</th>
                      <th className="py-3 px-4 text-left font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {relatorio.devedores.map((d: any) => (
                      <tr key={d.alunoId} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{d.nome}</td>
                        <td className="py-3 px-4 text-muted-foreground">{d.numeroBI}</td>
                        <td className="py-3 px-4">
                          <span className="text-red-600 font-medium">{d.quantidadeMeses}</span>
                          <span className="text-muted-foreground text-xs ml-1">({d.mesesAtrasados.join(", ")})</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-red-600">{d.totalAtrasado.toFixed(2)} MT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
