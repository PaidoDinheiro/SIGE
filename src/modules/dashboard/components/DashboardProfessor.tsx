"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, BookOpen, GraduationCap, PenTool, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetricsAction } from "../actions/dashboard.actions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DashboardProfessor() {
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
        <h2 className="text-2xl font-bold tracking-tight">Portal do Professor</h2>
        <p className="text-muted-foreground">Ano Letivo: {data.anoLetivo}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <BookOpen className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">As Minhas Turmas</p>
            <p className="text-2xl font-bold">{data.kpis.totalTurmas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <GraduationCap className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Disciplinas Lcionadas</p>
            <p className="text-2xl font-bold">{data.kpis.totalDisciplinas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <PenTool className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Notas Lançadas</p>
            <p className="text-2xl font-bold">{data.kpis.totalNotas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
            <p className="text-xs text-muted-foreground">Faltas Registadas</p>
            <p className="text-2xl font-bold">{data.kpis.totalFaltas}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carga e Registos por Turma/Disciplina</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.cargaHoraria}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="notas" name="Notas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="faltas" name="Faltas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
