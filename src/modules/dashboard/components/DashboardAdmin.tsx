"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Users, GraduationCap, School, BookOpen, Banknote, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetricsAction } from "../actions/dashboard.actions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function DashboardAdmin() {
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

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Administrativo</h2>
        <p className="text-muted-foreground">Visão geral do SIGE — Ano Letivo: {data.anoLetivo}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Users className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Alunos</p>
            <p className="text-2xl font-bold">{data.kpis.totalAlunos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <GraduationCap className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Professores</p>
            <p className="text-2xl font-bold">{data.kpis.totalProfessores}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <School className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Turmas</p>
            <p className="text-2xl font-bold">{data.kpis.totalTurmas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <BookOpen className="h-6 w-6 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Disciplinas</p>
            <p className="text-2xl font-bold">{data.kpis.totalDisciplinas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Banknote className="h-6 w-6 text-emerald-500 mb-2" />
            <p className="text-xs text-muted-foreground">Arrecadado</p>
            <p className="text-xl font-bold">{data.kpis.totalArrecadado.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-xs text-muted-foreground">Propinas Pendentes</p>
            <p className="text-xl font-bold text-red-600">{data.kpis.propinasPendentes.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alunos por Turma</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.alunosPorTurma}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="alunos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.receitaPorMes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
