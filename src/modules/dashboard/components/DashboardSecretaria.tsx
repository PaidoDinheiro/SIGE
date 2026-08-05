"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Users, School, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardMetricsAction } from "../actions/dashboard.actions";

export function DashboardSecretaria() {
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
        <h2 className="text-2xl font-bold tracking-tight">Secretaria Académica</h2>
        <p className="text-muted-foreground">Ano Letivo: {data.anoLetivo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
              <p className="text-3xl font-bold">{data.kpis.totalAlunos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <School className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Turmas Ativas</p>
              <p className="text-3xl font-bold">{data.kpis.turmasAtivas}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Matrículas Ativas</p>
              <p className="text-3xl font-bold">{data.kpis.matriculasAtivas}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
