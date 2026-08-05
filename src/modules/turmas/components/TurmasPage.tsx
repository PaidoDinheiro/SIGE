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

import { TurmaInput, TurmaSchema } from "@/src/modules/turmas/schemas/TurmaSchema";
import { getTurmasAction, createTurmaAction, updateTurmaAction, deleteTurmaAction } from "@/src/modules/turmas/actions/turma.actions";

export function TurmasPage() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<TurmaInput>({
    resolver: zodResolver(TurmaSchema) as any,
    defaultValues: {
      nome: "",
      anoLetivo: new Date().getFullYear().toString(),
    },
  });

  const loadTurmas = async (q?: string) => {
    setIsLoading(true);
    const result = await getTurmasAction(q);
    if (result.success) {
      setTurmas(result.data || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTurmas();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTurmas(search);
  };

  const handleEdit = (turma: any) => {
    setEditingId(turma.id);
    form.reset({
      nome: turma.nome,
      anoLetivo: turma.anoLetivo,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja arquivar esta turma?")) return;
    
    const result = await deleteTurmaAction(id);
    if (result.success) {
      toast.success("Turma arquivada com sucesso!");
      loadTurmas(search);
    } else {
      toast.error(result.error);
    }
  };

  const onSubmit = async (data: any) => {
    let result;
    if (editingId) {
      result = await updateTurmaAction(editingId, data);
    } else {
      result = await createTurmaAction(data);
    }

    if (result.success) {
      toast.success(editingId ? "Turma atualizada com sucesso!" : "Turma criada com sucesso!");
      setIsOpen(false);
      form.reset();
      setEditingId(null);
      loadTurmas(search);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Turmas</h2>
          <p className="text-muted-foreground">Gerir as turmas e anos letivos da instituição.</p>
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
              Nova Turma
            </Button>
          } />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Turma" : "Nova Turma"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Nome da Turma</FormLabel>
                      <FormControl><Input placeholder="Ex: 10ª Classe A" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="Ex: 2026" {...field} /></FormControl>
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
            placeholder="Pesquisar por nome ou ano letivo..." 
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
              <TableHead>Nome</TableHead>
              <TableHead>Ano Letivo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : turmas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                  Nenhuma turma encontrada.
                </TableCell>
              </TableRow>
            ) : (
              turmas.map((turma) => (
                <TableRow key={turma.id}>
                  <TableCell className="font-medium">{turma.nome}</TableCell>
                  <TableCell>{turma.anoLetivo}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(turma)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(turma.id)}>
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
