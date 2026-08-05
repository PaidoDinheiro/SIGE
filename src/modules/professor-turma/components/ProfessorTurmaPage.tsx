"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Search, Trash2, Edit } from "lucide-react";

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

import { ProfessorTurmaInput, ProfessorTurmaSchema } from "@/src/modules/professor-turma/schemas/ProfessorTurmaSchema";
import { getAssociacoesAction, createAssociacaoAction, updateAssociacaoAction, deleteAssociacaoAction, getProfessoresForSelectAction, getTurmasForSelectAction, getDisciplinasForSelectAction } from "@/src/modules/professor-turma/actions/professor-turma.actions";

export function ProfessorTurmaPage() {
  const [associacoes, setAssociacoes] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<ProfessorTurmaInput>({
    resolver: zodResolver(ProfessorTurmaSchema) as any,
    defaultValues: {
      turmaId: 0,
      disciplinaId: 0,
      professorId: 0,
    },
  });

  const loadData = async (q?: string) => {
    setIsLoading(true);
    const [assocResult, pResult, tResult, dResult] = await Promise.all([
      getAssociacoesAction(q),
      getProfessoresForSelectAction(),
      getTurmasForSelectAction(),
      getDisciplinasForSelectAction(),
    ]);

    if (assocResult.success) setAssociacoes(assocResult.data || []);
    else toast.error(assocResult.error);

    setProfessores(pResult || []);
    setTurmas(tResult || []);
    setDisciplinas(dResult || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search);
  };

  const handleEdit = (assoc: any) => {
    setEditingId(assoc.id);
    form.reset({
      turmaId: assoc.turmaId,
      disciplinaId: assoc.disciplinaId,
      professorId: assoc.professorId,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja arquivar esta associação?")) return;
    
    const result = await deleteAssociacaoAction(id);
    if (result.success) {
      toast.success("Associação arquivada com sucesso!");
      loadData(search);
    } else {
      toast.error(result.error);
    }
  };

  const onSubmit = async (data: any) => {
    let result;
    if (editingId) {
      result = await updateAssociacaoAction(editingId, data);
    } else {
      result = await createAssociacaoAction(data);
    }

    if (result.success) {
      toast.success(editingId ? "Associação atualizada com sucesso!" : "Associação criada com sucesso!");
      setIsOpen(false);
      form.reset();
      setEditingId(null);
      loadData(search);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Professor × Turma</h2>
          <p className="text-muted-foreground">Gerir as alocações de professores e disciplinas por turma.</p>
        </div>

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
              Nova Associação
            </Button>
          } />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Associação" : "Nova Associação"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="professorId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Professor</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                          <option value={0}>Selecione um professor...</option>
                          {professores.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="turmaId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Turma</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                          <option value={0}>Selecione uma turma...</option>
                          {turmas.map(t => (
                            <option key={t.id} value={t.id}>{t.nome} ({t.anoLetivo})</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disciplinaId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Disciplina</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                          <option value={0}>Selecione uma disciplina...</option>
                          {disciplinas.map(d => (
                            <option key={d.id} value={d.id}>{d.nome}</option>
                          ))}
                        </select>
                      </FormControl>
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
      </div>

      <div className="flex items-center space-x-2">
        <form onSubmit={onSearch} className="flex-1 flex space-x-2">
          <Input 
            placeholder="Pesquisar professor, turma ou disciplina..." 
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Professor</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : associacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Nenhuma associação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              associacoes.map((assoc) => (
                <TableRow key={assoc.id}>
                  <TableCell className="font-medium">{assoc.professor.nome}</TableCell>
                  <TableCell>{assoc.turma.nome} ({assoc.turma.anoLetivo})</TableCell>
                  <TableCell>{assoc.disciplina.nome}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(assoc)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(assoc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
