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

import { MatriculaInput, MatriculaSchema } from "@/src/modules/matriculas/schemas/MatriculaSchema";
import { getMatriculasAction, createMatriculaAction, updateMatriculaAction, deleteMatriculaAction, getAlunosForSelectAction, getTurmasForSelectAction } from "@/src/modules/matriculas/actions/matricula.actions";

export function MatriculasPage() {
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<MatriculaInput>({
    resolver: zodResolver(MatriculaSchema) as any,
    defaultValues: {
      alunoId: 0,
      turmaId: 0,
      anoLetivo: new Date().getFullYear().toString(),
      status: "ATIVA",
    },
  });

  const loadData = async (q?: string) => {
    setIsLoading(true);
    const [mResult, aResult, tResult] = await Promise.all([
      getMatriculasAction(q),
      getAlunosForSelectAction(),
      getTurmasForSelectAction()
    ]);

    if (mResult.success) setMatriculas(mResult.data || []);
    else toast.error(mResult.error);

    setAlunos(aResult || []);
    setTurmas(tResult || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search);
  };

  const handleEdit = (matricula: any) => {
    setEditingId(matricula.id);
    form.reset({
      alunoId: matricula.alunoId,
      turmaId: matricula.turmaId,
      anoLetivo: matricula.anoLetivo,
      status: matricula.status,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja arquivar esta matrícula?")) return;
    
    const result = await deleteMatriculaAction(id);
    if (result.success) {
      toast.success("Matrícula arquivada com sucesso!");
      loadData(search);
    } else {
      toast.error(result.error);
    }
  };

  const onSubmit = async (data: any) => {
    let result;
    if (editingId) {
      result = await updateMatriculaAction(editingId, data);
    } else {
      result = await createMatriculaAction(data);
    }

    if (result.success) {
      toast.success(editingId ? "Matrícula atualizada com sucesso!" : "Matrícula criada com sucesso!");
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
          <h2 className="text-2xl font-bold tracking-tight">Matrículas</h2>
          <p className="text-muted-foreground">Gerir as matrículas dos alunos nas turmas.</p>
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
              Nova Matrícula
            </Button>
          } />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Matrícula" : "Nova Matrícula"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="alunoId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Aluno</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                          <option value={0}>Selecione um aluno...</option>
                          {alunos.map(aluno => (
                            <option key={aluno.id} value={aluno.id}>
                              {aluno.usuario.nome} ({aluno.numeroBI})
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
                  name="turmaId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Turma</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          onChange={(e) => {
                            const tId = parseInt(e.target.value);
                            field.onChange(tId);
                            // Auto-fill anoLetivo based on selected turma
                            const t = turmas.find(x => x.id === tId);
                            if (t) {
                              form.setValue("anoLetivo", t.anoLetivo);
                            }
                          }}
                        >
                          <option value={0}>Selecione uma turma...</option>
                          {turmas.map(turma => (
                            <option key={turma.id} value={turma.id}>
                              {turma.nome} ({turma.anoLetivo})
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
                  name="anoLetivo"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Ano Letivo</FormLabel>
                      <FormControl><Input readOnly {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Estado da Matrícula</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="ATIVA">Ativa</option>
                          <option value="TRANSFERIDA">Transferida</option>
                          <option value="CONCLUIDA">Concluída</option>
                          <option value="CANCELADA">Cancelada</option>
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
            placeholder="Pesquisar aluno, turma ou ano letivo..." 
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
              <TableHead>Aluno</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Ano Letivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : matriculas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhuma matrícula encontrada.
                </TableCell>
              </TableRow>
            ) : (
              matriculas.map((mat) => (
                <TableRow key={mat.id}>
                  <TableCell className="font-medium">{mat.aluno.usuario.nome}</TableCell>
                  <TableCell>{mat.turma.nome}</TableCell>
                  <TableCell>{mat.anoLetivo}</TableCell>
                  <TableCell>{mat.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(mat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(mat.id)}>
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
