"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  Plus,
  X,
  Download,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { PagamentoSchema, PagamentoInput } from "../schemas/PagamentoSchema";
import {
  registrarPagamentoAction,
  cancelarPagamentoAction,
  getPagamentosAction,
  getAlunosParaPagamentoAction,
  getValorPropinaAction,
  getAnoLetivoAtivoAction,
} from "../actions/pagamento.actions";

interface Props {
  role: "ADMIN" | "TESOURARIA" | "SECRETARIA";
}

const canWrite = (role: string) => ["ADMIN", "TESOURARIA"].includes(role);

export function PagamentosPage({ role }: Props) {
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [valorPropina, setValorPropina] = useState(1200);
  const [anoLetivo, setAnoLetivo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [query, setQuery] = useState("");

  const form = useForm<PagamentoInput>({
    resolver: zodResolver(PagamentoSchema) as any,
    defaultValues: {
      alunoId: 0,
      mesReferencia: "",
      anoLetivo: "",
      valor: 0,
      metodoPagamento: "CAIXA",
      referenciaPagamento: "",
      observacao: "",
    },
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pays, als, propina, ano] = await Promise.all([
        getPagamentosAction({ query }),
        getAlunosParaPagamentoAction(),
        getValorPropinaAction(),
        getAnoLetivoAtivoAction(),
      ]);
      setPagamentos(pays);
      setAlunos(als);
      setValorPropina(propina);
      setAnoLetivo(ano);
      form.setValue("anoLetivo", ano);
      form.setValue("valor", propina);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [query]);

  const onSubmit = async (data: PagamentoInput) => {
    try {
      await registrarPagamentoAction(data);
      toast.success("Pagamento registado e recibo emitido com sucesso!");
      setIsDialogOpen(false);
      form.reset({ anoLetivo, valor: valorPropina, metodoPagamento: "CAIXA", alunoId: 0, mesReferencia: "", referenciaPagamento: "", observacao: "" });
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Confirma o cancelamento deste pagamento?")) return;
    try {
      await cancelarPagamentoAction(id);
      toast.success("Pagamento cancelado.");
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusColor = (status: string) => {
    if (status === "PAGO") return "default";
    if (status === "CANCELADO") return "destructive";
    return "outline";
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Pagamentos de Propinas</h2>
        <p className="text-muted-foreground">
          Gestão de pagamentos mensais — Propina: <strong>{valorPropina.toFixed(2)} MT</strong> | Ano Letivo: <strong>{anoLetivo}</strong>
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por aluno..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {canWrite(role) && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Registar Pagamento
          </Button>
        )}
      </div>

      {/* Tabela de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Aluno</th>
                  <th className="py-3 px-4 text-left font-medium">Mês Referência</th>
                  <th className="py-3 px-4 text-left font-medium">Valor</th>
                  <th className="py-3 px-4 text-left font-medium">Método</th>
                  <th className="py-3 px-4 text-left font-medium">Estado</th>
                  <th className="py-3 px-4 text-left font-medium">Recibo</th>
                  {canWrite(role) && <th className="py-3 px-4 text-left font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagamentos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      Nenhum pagamento registado.
                    </td>
                  </tr>
                )}
                {pagamentos.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{p.aluno.usuario.nome}</td>
                    <td className="py-3 px-4">{p.mesReferencia}</td>
                    <td className="py-3 px-4">{Number(p.valor).toFixed(2)} MT</td>
                    <td className="py-3 px-4">{p.metodoPagamento}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColor(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {p.recibo ? (
                        <a
                          href={`/api/recibo?pagamentoId=${p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          <Download className="h-3 w-3" />
                          {p.recibo.numero}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    {canWrite(role) && (
                      <td className="py-3 px-4">
                        {p.status !== "CANCELADO" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(p.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Novo Pagamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registar Pagamento de Propina</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="alunoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aluno</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      >
                        <option value={0}>Selecione o aluno...</option>
                        {alunos.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.usuario.nome}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mesReferencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês de Referência</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (MT)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metodoPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="CAIXA">Caixa</option>
                          <option value="TRANSFERENCIA">Transferência</option>
                          <option value="DEPOSITO">Depósito</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="referenciaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referência de Transação (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº do comprovativo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Observações adicionais..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirmar e Emitir Recibo
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
