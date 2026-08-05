"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Search, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

import { FaltaInput, FaltaSchema } from "@/src/modules/faltas/schemas/FaltaSchema";
import { getFaltasAction, createFaltaAction, updateFaltaAction, deleteFaltaAction } from "@/src/modules/faltas/actions/falta.actions";
import { getMatriculasForNotasAction, getTurmasDisciplinasForNotasAction, getTurmasForProfessorAction, getEducandosAction } from "@/src/modules/notas/actions/nota.actions";

export function FaltasPage({ role }: { role: "ADMIN" | "PROFESSOR" | "SECRETARIA" | "ALUNO" | "ENCARREGADO" }) {
  const [faltas, setFaltas] = useState<any[]>([]);
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [turmasDisciplinas, setTurmasDisciplinas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [educandos, setEducandos] = useState<any[]>([]);
  const [selectedEducandoId, setSelectedEducandoId] = useState<number | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const canEdit = role === "ADMIN" || role === "PROFESSOR";
  const showTurmaFilter = role === "ADMIN" || role === "PROFESSOR" || role === "SECRETARIA";
  const showEducandoSelector = role === "ENCARREGADO";

  const form = useForm<FaltaInput>({
    resolver: zodResolver(FaltaSchema) as any,
    defaultValues: {
      alunoId: 0,
      matriculaId: 0,
      turmaDisciplinaId: 0,
      data: new Date().toISOString().split("T")[0],
      tipo: "JUSTIFICADA",
      observacao: "",
    },
  });

  const loadData = async (q?: string) => {
    setIsLoading(true);
    const [faltasResult] = await Promise.all([
      getFaltasAction(q, selectedTurmaId || undefined),
    ]);

    if (faltasResult.success) setFaltas(faltasResult.data || []);
    else toast.error(faltasResult.error);

    if (canEdit) {
      const [matResult, tdResult, turmasResult] = await Promise.all([
        getMatriculasForNotasAction(selectedTurmaId || undefined),
        getTurmasDisciplinasForNotasAction(),
        getTurmasForProfessorAction(),
      ]);
      setMatriculas(matResult || []);
      setTurmasDisciplinas(tdResult || []);
      setTurmas(turmasResult || []);
    } else if (showTurmaFilter) {
      const turmasResult = await getTurmasForProfessorAction();
      setTurmas(turmasResult || []);
    }

    if (showEducandoSelector) {
      const eduResult = await getEducandosAction();
      setEducandos(eduResult || []);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recarregar quando turma muda
  useEffect(() => {
    if (selectedTurmaId !== null) {
      loadData(search);
    }
  }, [selectedTurmaId]);

  // Recarregar matrículas quando turma é selecionada (para formulário)
  useEffect(() => {
    if (canEdit && selectedTurmaId) {
      getMatriculasForNotasAction(selectedTurmaId).then(res => setMatriculas(res || []));
    }
  }, [selectedTurmaId]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search);
  };

  const handleEdit = (falta: any) => {
    setEditingId(falta.id);
    form.reset({
      alunoId: falta.alunoId,
      matriculaId: falta.matriculaId,
      turmaDisciplinaId: falta.turmaDisciplinaId,
      data: new Date(falta.data).toISOString().split("T")[0],
      tipo: falta.tipo,
      observacao: falta.observacao || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja apagar este registo de falta?")) return;
    
    const result = await deleteFaltaAction(id);
    if (result.success) {
      toast.success("Falta removida com sucesso!");
      loadData(search);
    } else {
      toast.error(result.error);
    }
  };

  const onSubmit = async (data: any) => {
    let result;
    if (editingId) {
      result = await updateFaltaAction(editingId, data);
    } else {
      result = await createFaltaAction(data);
    }

    if (result.success) {
      toast.success(editingId ? "Falta atualizada com sucesso!" : "Falta registada com sucesso!");
      setIsOpen(false);
      form.reset();
      setEditingId(null);
      loadData(search);
    } else {
      toast.error(result.error);
    }
  };

  // Filtrar faltas visíveis por educando selecionado (client-side)
  const filteredFaltas = faltas.filter(falta => {
    if (showEducandoSelector && selectedEducandoId && falta.alunoId !== selectedEducandoId) return false;
    return true;
  });

  // Filtrar turma-disciplinas por turma selecionada
  const filteredTdByTurma = selectedTurmaId
    ? turmasDisciplinas.filter(td => td.turma?.id === selectedTurmaId)
    : turmasDisciplinas;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {role === "ALUNO" ? "Minhas Faltas" : role === "ENCARREGADO" ? "Faltas dos Educandos" : "Faltas"}
          </h2>
          <p className="text-muted-foreground">
            {role === "ALUNO" 
              ? "Consulte aqui as suas faltas por disciplina."
              : role === "ENCARREGADO"
              ? "Consulte aqui as faltas dos seus educandos."
              : "Consulta e registo de presenças / faltas."}
          </p>
        </div>

        {canEdit && (
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              form.reset();
              setEditingId(null);
            }
          }}>
            <DialogTrigger render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registar Falta
              </Button>
            } />
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Falta" : "Registar Falta"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  
                  {!editingId && (
                    <>
                      {/* Filtro por turma no formulário */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Selecionar Turma</label>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={selectedTurmaId || ""}
                          onChange={(e) => {
                            const id = e.target.value ? parseInt(e.target.value) : null;
                            setSelectedTurmaId(id);
                          }}
                        >
                          <option value="">Todas as turmas...</option>
                          {turmas.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                          ))}
                        </select>
                      </div>

                      <FormField
                        control={form.control}
                        name="matriculaId"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Aluno</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                {...field}
                                onChange={(e) => {
                                  const mId = parseInt(e.target.value);
                                  field.onChange(mId);
                                  const mat = matriculas.find(x => x.id === mId);
                                  if (mat) {
                                    form.setValue("alunoId", mat.alunoId);
                                  }
                                }}
                              >
                                <option value={0}>Selecione o aluno...</option>
                                {matriculas.map(m => (
                                  <option key={m.id} value={m.id}>
                                    {m.aluno.usuario.nome} - Turma {m.turma.nome}
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
                        name="turmaDisciplinaId"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Disciplina / Turma</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              >
                                <option value={0}>Selecione...</option>
                                {filteredTdByTurma.map(td => (
                                  <option key={td.id} value={td.id}>
                                    {td.disciplina.nome} (Turma {td.turma.nome})
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Tipo de Falta</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            {...field}
                          >
                            <option value="JUSTIFICADA">Justificada</option>
                            <option value="INJUSTIFICADA">Injustificada</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observacao"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Observação (Opcional)</FormLabel>
                        <FormControl><Input placeholder="Motivo da falta..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Seletor de educando (ENCARREGADO) */}
        {showEducandoSelector && educandos.length > 1 && (
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedEducandoId || ""}
            onChange={(e) => setSelectedEducandoId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Todos os Educandos</option>
            {educandos.map((edu: any) => (
              <option key={edu.id} value={edu.id}>{edu.usuario.nome}</option>
            ))}
          </select>
        )}

        {/* Filtro de turma */}
        {showTurmaFilter && (
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedTurmaId || ""}
            onChange={(e) => setSelectedTurmaId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((t: any) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        )}

        <form onSubmit={onSearch} className="flex-1 flex space-x-2">
          <Input 
            placeholder="Pesquisar por aluno ou disciplina..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Pesquisar
          </Button>
        </form>
      </div>

      {/* Indicador de educandos (ENCARREGADO) */}
      {showEducandoSelector && educandos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {educandos.map((edu: any) => (
            <Badge 
              key={edu.id} 
              variant={selectedEducandoId === edu.id ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedEducandoId(selectedEducandoId === edu.id ? null : edu.id)}
            >
              {edu.usuario.nome}
            </Badge>
          ))}
        </div>
      )}

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Observação</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredFaltas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="text-center h-24 text-muted-foreground">
                  {role === "ALUNO" 
                    ? "Não possui faltas registadas."
                    : role === "ENCARREGADO"
                    ? "Nenhuma falta encontrada para os seus educandos."
                    : "Nenhum registo de falta encontrado."}
                </TableCell>
              </TableRow>
            ) : (
              filteredFaltas.map((falta) => (
                <TableRow key={falta.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(falta.data), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">{falta.aluno.usuario.nome}</TableCell>
                  <TableCell>{falta.disciplina.nome}</TableCell>
                  <TableCell>{falta.turmaDisciplina.turma.nome}</TableCell>
                  <TableCell>
                    <Badge variant={falta.tipo === "JUSTIFICADA" ? "secondary" : "destructive"}>
                      {falta.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{falta.observacao || "-"}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(falta)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(falta.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
