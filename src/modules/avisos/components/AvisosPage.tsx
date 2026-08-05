"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Megaphone, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AvisoInput, AvisoSchema } from "../schemas/AvisoSchema";
import {
  getAvisosAction,
  createAvisoAction,
  updateAvisoAction,
  deleteAvisoAction,
} from "../actions/aviso.actions";

interface Props {
  canWrite: boolean;
}

export function AvisosPage({ canWrite }: Props) {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<AvisoInput>({
    resolver: zodResolver(AvisoSchema) as any,
    defaultValues: {
      titulo: "",
      conteudo: "",
    },
  });

  const loadAvisos = async () => {
    try {
      setIsLoading(true);
      const data = await getAvisosAction();
      setAvisos(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvisos();
  }, []);

  const onSubmit = async (data: AvisoInput) => {
    try {
      if (editingId) {
        await updateAvisoAction(editingId, data);
        toast.success("Aviso atualizado.");
      } else {
        await createAvisoAction(data);
        toast.success("Aviso publicado.");
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
      loadAvisos();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = (aviso: any) => {
    setEditingId(aviso.id);
    form.reset({ titulo: aviso.titulo, conteudo: aviso.conteudo });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem a certeza que deseja eliminar este aviso?")) return;
    try {
      await deleteAvisoAction(id);
      toast.success("Aviso eliminado.");
      loadAvisos();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quadro de Avisos</h2>
          <p className="text-muted-foreground">Comunicados e informações gerais da escola.</p>
        </div>
        {canWrite && (
          <Button onClick={() => { setEditingId(null); form.reset(); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Aviso
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {avisos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum aviso publicado no momento.</p>
            </CardContent>
          </Card>
        ) : (
          avisos.map((aviso) => (
            <Card key={aviso.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-1">{aviso.titulo}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Publicado em {new Date(aviso.publicadoEm).toLocaleDateString("pt-MZ")} às {new Date(aviso.publicadoEm).toLocaleTimeString("pt-MZ", {hour: '2-digit', minute:'2-digit'})} por {aviso.autor?.nome} ({aviso.autor?.tipoUsuario})
                  </p>
                </div>
                {canWrite && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(aviso)}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(aviso.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {aviso.conteudo}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Aviso" : "Publicar Novo Aviso"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do comunicado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conteudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mensagem do aviso..." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Guardar Alterações" : "Publicar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
