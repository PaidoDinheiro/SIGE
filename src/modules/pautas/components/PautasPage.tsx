"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ScrollText, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTurmasForPautaAction, getDisciplinasDaTurmaForPautaAction } from "../actions/pauta.actions";

export function PautasPage() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<number>(0);
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<number>(0);
  const [selectedTrimestre, setSelectedTrimestre] = useState<number>(1);
  const [selectedAnoLetivo, setSelectedAnoLetivo] = useState<string>("2026");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadTurmas = async () => {
      try {
        setIsLoading(true);
        const list = await getTurmasForPautaAction();
        setTurmas(list || []);
        if (list && list.length > 0) {
          setSelectedTurmaId(list[0].id);
          setSelectedAnoLetivo(list[0].anoLetivo);
          // Carrega as disciplinas da primeira turma
          const discs = await getDisciplinasDaTurmaForPautaAction(list[0].id);
          setDisciplinas(discs || []);
          if (discs && discs.length > 0) {
            setSelectedDisciplinaId(discs[0].id);
          }
        }
      } catch (err: any) {
        toast.error("Erro ao carregar turmas: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTurmas();
  }, []);

  const handleTurmaChange = async (turmaId: number) => {
    setSelectedTurmaId(turmaId);
    const turma = turmas.find(t => t.id === turmaId);
    if (turma) {
      setSelectedAnoLetivo(turma.anoLetivo);
    }
    try {
      const discs = await getDisciplinasDaTurmaForPautaAction(turmaId);
      setDisciplinas(discs || []);
      if (discs && discs.length > 0) {
        setSelectedDisciplinaId(discs[0].id);
      } else {
        setSelectedDisciplinaId(0);
      }
    } catch (err: any) {
      toast.error("Erro ao carregar disciplinas: " + err.message);
    }
  };

  const handleDownload = () => {
    if (!selectedTurmaId || !selectedDisciplinaId) {
      toast.error("Selecione a turma e a disciplina.");
      return;
    }

    setIsGenerating(true);
    const url = `/api/pauta?turmaId=${selectedTurmaId}&disciplinaId=${selectedDisciplinaId}&trimestre=${selectedTrimestre}&anoLetivo=${selectedAnoLetivo}`;
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
        <h2 className="text-2xl font-bold tracking-tight">Pautas de Aproveitamento</h2>
        <p className="text-muted-foreground">Emissão oficial de pautas de turma por disciplina em formato PDF.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Parâmetros da Pauta
          </CardTitle>
          <CardDescription>Configure os filtros abaixo para gerar a pauta oficial.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Turma</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={selectedTurmaId}
              onChange={(e) => handleTurmaChange(parseInt(e.target.value))}
            >
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.anoLetivo})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Disciplina</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={selectedDisciplinaId}
              onChange={(e) => setSelectedDisciplinaId(parseInt(e.target.value))}
              disabled={disciplinas.length === 0}
            >
              {disciplinas.length === 0 ? (
                <option value={0}>Nenhuma disciplina associada a esta turma</option>
              ) : (
                disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))
              )}
            </select>
          </div>

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
              <input
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground focus:outline-none cursor-not-allowed"
                value={selectedAnoLetivo}
                disabled
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleDownload} 
              disabled={isGenerating || disciplinas.length === 0}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Gerar Pauta (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
