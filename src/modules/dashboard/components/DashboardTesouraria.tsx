"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Banknote, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetricsAction } from "../actions/dashboard.actions";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function DashboardTesouraria() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const metrics = await getDashboardMetricsAction();
        setData(metrics);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tesouraria</h2>
        <p className="text-muted-foreground">Resumo Financeiro — Ano Letivo: {data.anoLetivo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Banknote className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Anual</p>
              <p className="text-3xl font-bold text-emerald-600">{data.kpis.receitaAnual.toFixed(0)} MT</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dívida Ativa</p>
              <p className="text-3xl font-bold text-red-600">{data.kpis.propinasAtrasadas.toFixed(0)} MT</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="h-10 w-10 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Meses Atrasados</p>
              <p className="text-3xl font-bold">{data.kpis.qtdAtrasados}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.charts.receitaPorMetodo}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {data.charts.receitaPorMetodo.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)} MT`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
