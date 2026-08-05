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

import { AlunoInput, AlunoSchema } from "@/src/modules/alunos/schemas/AlunoSchema";
import { getAlunosAction, createAlunoAction, updateAlunoAction, deleteAlunoAction } from "@/src/modules/alunos/actions/aluno.actions";

export function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<AlunoInput>({
    resolver: zodResolver(AlunoSchema) as any,
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      numeroBI: "",
      dataNascimento: "",
      contacto: "",
      nomeEncarregado: "",
      contactoEncarregado: "",
    },
  });

  const loadAlunos = async (q?: string) => {
    setIsLoading(true);
    const result = await getAlunosAction(q);
    if (result.success) {
      setAlunos(result.data || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAlunos();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAlunos(search);
  };

  const handleEdit = (aluno: any) => {
    setEditingId(aluno.id);
    form.reset({
      nome: aluno.usuario.nome,
      email: aluno.usuario.email,
      senha: "", // senha omitida ao editar
      numeroBI: aluno.numeroBI,
      dataNascimento: new Date(aluno.dataNascimento).toISOString().split('T')[0],
      contacto: aluno.contacto || "",
      nomeEncarregado: aluno.nomeEncarregado,
      contactoEncarregado: aluno.contactoEncarregado || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja arquivar este aluno?")) return;
    
    const result = await deleteAlunoAction(id);
    if (result.success) {
      toast.success("Aluno arquivado com sucesso!");
      loadAlunos(search);
    } else {
      toast.error(result.error);
    }
  };

  const onSubmit = async (data: any) => {
    let result;
    if (editingId) {
      result = await updateAlunoAction(editingId, data);
    } else {
      result = await createAlunoAction(data);
    }

    if (result.success) {
      toast.success(editingId ? "Aluno atualizado com sucesso!" : "Aluno criado com sucesso!");
      setIsOpen(false);
      form.reset();
      setEditingId(null);
      loadAlunos(search);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alunos</h2>
          <p className="text-muted-foreground">Gerir os alunos matriculados na instituição.</p>
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
              Novo Aluno
            </Button>
          } />
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    name="numeroBI"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Número de BI</FormLabel>
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
                        <FormLabel>E-mail</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contacto"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Contacto (Telefone)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nomeEncarregado"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Nome do Encarregado</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactoEncarregado"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Contacto do Encarregado</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
            placeholder="Pesquisar por nome, email ou BI..." 
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
              <TableHead>BI</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Encarregado</TableHead>
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
            ) : alunos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            ) : (
              alunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className="font-medium">{aluno.usuario.nome}</TableCell>
                  <TableCell>{aluno.numeroBI}</TableCell>
                  <TableCell>{aluno.usuario.email}</TableCell>
                  <TableCell>{aluno.nomeEncarregado}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(aluno)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(aluno.id)}>
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
