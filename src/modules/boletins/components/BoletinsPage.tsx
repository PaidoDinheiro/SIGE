"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, FileText, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAlunosForBoletimAction, getMatriculasAtivasForBoletimAction } from "../actions/boletim.actions";

export function BoletinsPage({ role }: { role: "ADMIN" | "SECRETARIA" | "ALUNO" | "ENCARREGADO" }) {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<number>(0);
  const [selectedTrimestre, setSelectedTrimestre] = useState<number>(1);
  const [selectedAnoLetivo, setSelectedAnoLetivo] = useState<string>("2026");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        if (role !== "ALUNO") {
          const list = await getAlunosForBoletimAction();
          setAlunos(list || []);
          if (list && list.length > 0) {
            setSelectedAlunoId(list[0].id);
            // Carrega matriculas para o primeiro aluno
            const mats = await getMatriculasAtivasForBoletimAction(list[0].id);
            setMatriculas(mats || []);
            if (mats && mats.length > 0) {
              setSelectedAnoLetivo(mats[0].anoLetivo);
            }
          }
        } else {
          // Se for aluno, carrega direto suas matriculas
          const mats = await getMatriculasAtivasForBoletimAction();
          setMatriculas(mats || []);
          if (mats && mats.length > 0) {
            setSelectedAnoLetivo(mats[0].anoLetivo);
          }
        }
      } catch (err: any) {
        toast.error("Erro ao carregar dados: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [role]);

  const handleAlunoChange = async (alunoId: number) => {
    setSelectedAlunoId(alunoId);
    try {
      const mats = await getMatriculasAtivasForBoletimAction(alunoId);
      setMatriculas(mats || []);
      if (mats && mats.length > 0) {
        setSelectedAnoLetivo(mats[0].anoLetivo);
      }
    } catch (err: any) {
      toast.error("Erro ao carregar matrículas: " + err.message);
    }
  };

  const handleDownload = () => {
    let aId = selectedAlunoId;
    if (role === "ALUNO" && matriculas.length > 0) {
      aId = matriculas[0].alunoId;
    }

    if (role !== "ALUNO" && !aId) {
      toast.error("Selecione um aluno.");
      return;
    }

    setIsGenerating(true);
    const url = `/api/boletim?alunoId=${aId}&trimestre=${selectedTrimestre}&anoLetivo=${selectedAnoLetivo}`;
    window.open(url, "_blank");
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Boletins Escolares</h2>
        <p className="text-muted-foreground">Emissão oficial de boletins trimestrais em formato PDF.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Parâmetros do Boletim
          </CardTitle>
          <CardDescription>Configure os filtros abaixo para gerar o boletim de aproveitamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {role !== "ALUNO" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione o Aluno</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedAlunoId}
                onChange={(e) => handleAlunoChange(parseInt(e.target.value))}
              >
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.usuario.nome} (BI: {a.numeroBI})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trimestre</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedTrimestre}
                onChange={(e) => setSelectedTrimestre(parseInt(e.target.value))}
              >
                <option value={1}>1º Trimestre</option>
                <option value={2}>2º Trimestre</option>
                <option value={3}>3º Trimestre</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano Letivo</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedAnoLetivo}
                onChange={(e) => setSelectedAnoLetivo(e.target.value)}
              >
                {matriculas.map((m) => (
                  <option key={m.id} value={m.anoLetivo}>
                    {m.anoLetivo} (Turma: {m.turma.nome})
                  </option>
                ))}
                {matriculas.length === 0 && (
                  <option value="2026">2026</option>
                )}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full" size="lg" onClick={handleDownload} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Gerar Boletim (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
