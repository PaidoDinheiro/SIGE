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

import { EncarregadoInput, EncarregadoSchema } from "@/src/modules/encarregados/schemas/EncarregadoSchema";
import { getEncarregadosAction, createEncarregadoAction, updateEncarregadoAction, deleteEncarregadoAction } from "@/src/modules/encarregados/actions/encarregado.actions";

export function EncarregadosPage() {
  const [encarregados, setEncarregados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<EncarregadoInput>({
    resolver: zodResolver(EncarregadoSchema) as any,
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      ativo: true,
    },
  });

  const loadEncarregados = async (q?: string) => {
    setIsLoading(true);
    const result = await getEncarregadosAction(q);
    if (result.success) {
      setEncarregados(result.data || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadEncarregados();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEncarregados(search);
  };

  const handleEdit = (encarregado: any) => {
    setEditingId(encarregado.id);
    form.reset({
      nome: encarregado.nome,
      email: encarregado.email,
      senha: "", 
      ativo: encarregado.ativo,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja arquivar este encarregado?")) return;
    
    const result = await deleteEncarregadoAction(id);
    if (result.success) {
      toast.success("Encarregado arquivado com sucesso!");
      loadEncarregados(search);
    } else {
      toast.error(result.error);
    }
  };

  const onSubmit = async (data: any) => {
    let result;
    if (editingId) {
      result = await updateEncarregadoAction(editingId, data);
    } else {
      result = await createEncarregadoAction(data);
    }

    if (result.success) {
      toast.success(editingId ? "Encarregado atualizado com sucesso!" : "Encarregado criado com sucesso!");
      setIsOpen(false);
      form.reset();
      setEditingId(null);
      loadEncarregados(search);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Encarregados</h2>
          <p className="text-muted-foreground">Gerir as contas dos Encarregados de Educação.</p>
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
              Novo Encarregado
            </Button>
          } />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Encarregado" : "Novo Encarregado"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>E-mail (Login)</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Palavra-passe {editingId && "(deixe em branco para manter)"}</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
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
            placeholder="Pesquisar por nome ou email..." 
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
              <TableHead>E-mail</TableHead>
              <TableHead>Estado</TableHead>
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
            ) : encarregados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Nenhum encarregado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              encarregados.map((enc) => (
                <TableRow key={enc.id}>
                  <TableCell className="font-medium">{enc.nome}</TableCell>
                  <TableCell>{enc.email}</TableCell>
                  <TableCell>{enc.ativo ? "Ativo" : "Inativo"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(enc)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(enc.id)}>
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
