"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Search, Edit } from "lucide-react";

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

import { NotaInput, NotaSchema } from "@/src/modules/notas/schemas/NotaSchema";
import { 
  getNotasAction, 
  createNotaAction, 
  updateNotaAction, 
  getMatriculasForNotasAction, 
  getTurmasDisciplinasForNotasAction,
  getTurmasForProfessorAction,
  getEducandosAction,
} from "@/src/modules/notas/actions/nota.actions";

export function NotasPage({ role }: { role: "ADMIN" | "PROFESSOR" | "SECRETARIA" | "ALUNO" | "ENCARREGADO" }) {
  const [notas, setNotas] = useState<any[]>([]);
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

  const form = useForm<NotaInput>({
    resolver: zodResolver(NotaSchema) as any,
    defaultValues: {
      alunoId: 0,
      matriculaId: 0,
      turmaDisciplinaId: 0,
      trimestre: 1,
      anoLetivo: new Date().getFullYear().toString(),
      acs1: 0,
      acs2: 0,
      acp: 0,
    },
  });

  const loadData = async (q?: string) => {
    setIsLoading(true);
    const [notasResult] = await Promise.all([
      getNotasAction(q),
    ]);

    if (notasResult.success) setNotas(notasResult.data || []);
    else toast.error(notasResult.error);

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

  const handleEdit = (nota: any) => {
    setEditingId(nota.id);
    form.reset({
      alunoId: nota.alunoId,
      matriculaId: nota.matriculaId,
      turmaDisciplinaId: nota.turmaDisciplinaId,
      trimestre: nota.trimestre,
      anoLetivo: nota.anoLetivo,
      acs1: Number(nota.acs1),
      acs2: Number(nota.acs2),
      acp: Number(nota.acp),
    });
    setIsOpen(true);
  };

  const onSubmit = async (data: any) => {
    let result;
    if (editingId) {
      result = await updateNotaAction(editingId, data);
    } else {
      result = await createNotaAction(data);
    }

    if (result.success) {
      toast.success(editingId ? "Nota atualizada com sucesso!" : "Nota lançada com sucesso!");
      setIsOpen(false);
      form.reset();
      setEditingId(null);
      loadData(search);
    } else {
      toast.error(result.error);
    }
  };

  // Filtrar notas visíveis por turma selecionada (client-side) e educando
  const filteredNotas = notas.filter(nota => {
    if (selectedTurmaId && nota.turmaDisciplina?.turma?.id !== selectedTurmaId) return false;
    if (showEducandoSelector && selectedEducandoId && nota.alunoId !== selectedEducandoId) return false;
    return true;
  });

  // Agrupar turmas das disciplinas filtradas (para o filtro de turma no formulário)
  const filteredTdByTurma = selectedTurmaId 
    ? turmasDisciplinas.filter(td => td.turma?.id === selectedTurmaId)
    : turmasDisciplinas;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {role === "ALUNO" ? "Minhas Notas" : role === "ENCARREGADO" ? "Notas dos Educandos" : "Notas Académicas"}
          </h2>
          <p className="text-muted-foreground">
            {role === "ALUNO" 
              ? "Consulte aqui as suas notas por disciplina e trimestre." 
              : role === "ENCARREGADO"
              ? "Consulte aqui as notas dos seus educandos."
              : "Consulta e lançamento de notas (ACS1, ACS2, ACP)."}
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
                Lançar Notas
              </Button>
            } />
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Corrigir Notas" : "Lançar Notas"}</DialogTitle>
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
                            <FormLabel>Aluno (Matrícula Ativa)</FormLabel>
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
                                    form.setValue("anoLetivo", mat.anoLetivo);
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

                      <FormField
                        control={form.control}
                        name="trimestre"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Trimestre</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              >
                                <option value={1}>1º Trimestre</option>
                                <option value={2}>2º Trimestre</option>
                                <option value={3}>3º Trimestre</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="acs1"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>ACS 1</FormLabel>
                          <FormControl><Input type="number" step="0.1" min={0} max={20} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="acs2"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>ACS 2</FormLabel>
                          <FormControl><Input type="number" step="0.1" min={0} max={20} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="acp"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>ACP</FormLabel>
                          <FormControl><Input type="number" step="0.1" min={0} max={20} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar e Calcular
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

        {/* Filtro de turma (ADMIN, PROFESSOR, SECRETARIA) */}
        {showTurmaFilter && !canEdit && (
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

        {/* Filtro por turma visível na listagem para quem pode editar */}
        {canEdit && (
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedTurmaId || ""}
            onChange={(e) => setSelectedTurmaId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Filtrar por turma...</option>
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
              <TableHead>Aluno</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Trimestre</TableHead>
              <TableHead className="text-center">ACS1</TableHead>
              <TableHead className="text-center">ACS2</TableHead>
              <TableHead className="text-center">ACP</TableHead>
              <TableHead className="text-center font-bold">Média</TableHead>
              <TableHead>Situação</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 10 : 9} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredNotas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 10 : 9} className="text-center h-24 text-muted-foreground">
                  {role === "ALUNO" 
                    ? "Ainda não possui notas lançadas." 
                    : role === "ENCARREGADO"
                    ? "Nenhuma nota encontrada para os seus educandos."
                    : "Nenhum lançamento de nota encontrado."}
                </TableCell>
              </TableRow>
            ) : (
              filteredNotas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell className="font-medium whitespace-nowrap">{nota.aluno.usuario.nome}</TableCell>
                  <TableCell>{nota.disciplina.nome}</TableCell>
                  <TableCell>{nota.turmaDisciplina.turma.nome}</TableCell>
                  <TableCell>{nota.trimestre}º Trim</TableCell>
                  <TableCell className="text-center">{Number(nota.acs1)}</TableCell>
                  <TableCell className="text-center">{Number(nota.acs2)}</TableCell>
                  <TableCell className="text-center">{Number(nota.acp)}</TableCell>
                  <TableCell className="text-center font-bold">{Number(nota.media)}</TableCell>
                  <TableCell>
                    <Badge variant={nota.situacao === "APROVADO" ? "default" : "destructive"}>
                      {nota.situacao}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(nota)}>
                        <Edit className="h-4 w-4" />
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
