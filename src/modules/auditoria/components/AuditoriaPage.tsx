"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, History, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuditoriaLogsAction } from "../actions/auditoria.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Filters
  const [entidade, setEntidade] = useState("");
  const [acao, setAcao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (entidade) filters.entidade = entidade;
      if (acao) filters.acao = acao;
      if (dataInicio) filters.dataInicio = new Date(dataInicio);
      if (dataFim) filters.dataFim = new Date(dataFim);

      const result = await getAuditoriaLogsAction(filters, 100, 0);
      setLogs(result.logs);
      setTotal(result.total);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAcaoColor = (a: string) => {
    switch (a) {
      case "CREATE": return "default";
      case "UPDATE": return "secondary";
      case "DELETE": return "destructive";
      case "LOGIN": return "outline";
      case "LOGOUT": return "outline";
      case "PAYMENT": return "default";
      case "GENERATE_RECEIPT": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Auditoria do Sistema</h2>
        <p className="text-muted-foreground">Registo centralizado de operações críticas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Entidade</label>
              <Input placeholder="Ex: Pagamento, Nota..." value={entidade} onChange={e => setEntidade(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Ação</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={acao}
                onChange={e => setAcao(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="CREATE">Criar</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="PAYMENT">Pagamento</option>
                <option value="GENERATE_RECEIPT">Emitir Recibo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Data Início</label>
              <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Data Fim</label>
              <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
            </div>
          </div>
          <Button onClick={loadData} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Pesquisar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Logs de Operações
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              Exibindo os últimos {logs.length} de {total} registos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Data/Hora</th>
                  <th className="py-3 px-4 text-left font-medium">Utilizador</th>
                  <th className="py-3 px-4 text-left font-medium">Ação</th>
                  <th className="py-3 px-4 text-left font-medium">Entidade</th>
                  <th className="py-3 px-4 text-left font-medium">ID Entidade</th>
                  <th className="py-3 px-4 text-left font-medium">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      Nenhum log encontrado.
                    </td>
                  </tr>
                )}
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("pt-MZ")}
                    </td>
                    <td className="py-3 px-4">
                      {log.usuario ? (
                        <div>
                          <span className="font-medium">{log.usuario.nome}</span>
                          <span className="text-xs text-muted-foreground block">{log.usuario.tipoUsuario}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sistema</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getAcaoColor(log.acao)}>{log.acao}</Badge>
                    </td>
                    <td className="py-3 px-4">{log.entidade}</td>
                    <td className="py-3 px-4">{log.entidadeId || "—"}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                        Ver Dados
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Operação</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold block text-muted-foreground">Ação</span>
                  {selectedLog.acao}
                </div>
                <div>
                  <span className="font-semibold block text-muted-foreground">Entidade</span>
                  {selectedLog.entidade} (ID: {selectedLog.entidadeId || "N/A"})
                </div>
                <div>
                  <span className="font-semibold block text-muted-foreground">Data</span>
                  {new Date(selectedLog.createdAt).toLocaleString("pt-MZ")}
                </div>
                <div>
                  <span className="font-semibold block text-muted-foreground">IP</span>
                  {selectedLog.ip || "N/A"}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border rounded-md p-3 bg-muted/20">
                  <span className="font-semibold block text-muted-foreground mb-2 text-xs uppercase">Dados Anteriores</span>
                  <pre className="text-xs overflow-x-auto">
                    {selectedLog.dadosAnteriores ? JSON.stringify(selectedLog.dadosAnteriores, null, 2) : "Nenhum dado."}
                  </pre>
                </div>
                <div className="border rounded-md p-3 bg-muted/20">
                  <span className="font-semibold block text-muted-foreground mb-2 text-xs uppercase">Dados Novos</span>
                  <pre className="text-xs overflow-x-auto">
                    {selectedLog.dadosNovos ? JSON.stringify(selectedLog.dadosNovos, null, 2) : "Nenhum dado."}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
