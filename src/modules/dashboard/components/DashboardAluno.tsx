"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Book, AlertCircle, TrendingUp, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetricsAction } from "../actions/dashboard.actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DashboardAluno() {
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
        <h2 className="text-2xl font-bold tracking-tight">Portal do Aluno</h2>
        <p className="text-muted-foreground">Ano Letivo: {data.anoLetivo}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <TrendingUp className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Média Global</p>
            <p className="text-2xl font-bold">{data.kpis.mediaGeral.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mb-2" />
            <p className="text-xs text-muted-foreground">Total Faltas</p>
            <p className="text-2xl font-bold">{data.kpis.totalFaltas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-xs text-muted-foreground">Injustificadas</p>
            <p className="text-2xl font-bold">{data.kpis.faltasInjustificadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CreditCard className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Meses em Atraso</p>
            <p className="text-2xl font-bold">{data.kpis.mesesAtrasados}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Notas por Disciplina</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.charts.desempenhoPorDisciplina}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="disciplina" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 20]} />
              <Tooltip />
              <Line type="monotone" dataKey="media" name="Média" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
