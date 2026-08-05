"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ConfiguracaoEscolaInput, ConfiguracaoEscolaSchema } from "@/src/modules/configuracoes/schemas/ConfiguracaoSchema";
import { updateConfiguracaoAction, getConfiguracaoAction } from "@/src/modules/configuracoes/actions/configuracao.actions";

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(ConfiguracaoEscolaSchema) as any,
    defaultValues: {
      nome: "",
      endereco: "",
      telefone: "",
      email: "",
      website: "",
      diretor: "",
      anoLetivoAtivo: "",
      numeroTrimestres: 3,
      notaMinimaAprovacao: 10,
      valorPropina: 1200,
      banco: "",
      contaBancaria: "",
      nib: "",
    },
  });

  useEffect(() => {
    async function fetchConfig() {
      const result = await getConfiguracaoAction();
      if (result.success && result.data) {
        form.reset({
          nome: result.data.nome,
          endereco: result.data.endereco || "",
          telefone: result.data.telefone || "",
          email: result.data.email || "",
          website: result.data.website || "",
          diretor: result.data.diretor,
          anoLetivoAtivo: result.data.anoLetivoAtivo,
          numeroTrimestres: result.data.numeroTrimestres,
          notaMinimaAprovacao: Number(result.data.notaMinimaAprovacao),
          valorPropina: Number(result.data.valorPropina),
          banco: result.data.banco || "",
          contaBancaria: result.data.contaBancaria || "",
          nib: result.data.nib || "",
        });
      }
      setIsLoading(false);
    }
    fetchConfig();
  }, [form]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  async function onSubmit(data: any) {
    setIsSaving(true);
    const result = await updateConfiguracaoAction(data);
    
    if (result.success) {
      toast.success("Configurações atualizadas com sucesso!");
    } else {
      toast.error(result.error || "Ocorreu um erro ao atualizar.");
    }
    
    setIsSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerir os parâmetros institucionais, académicos e financeiros da escola.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Institucional */}
          <Card>
            <CardHeader>
              <CardTitle>Institucional</CardTitle>
              <CardDescription>
                Informações de identificação da escola.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Nome da Escola</FormLabel>
                    <FormControl>
                      <Input placeholder="Escola Da Catedral – Beira" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diretor"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Diretor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do Diretor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }: any) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço da escola" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Académico */}
          <Card>
            <CardHeader>
              <CardTitle>Académico</CardTitle>
              <CardDescription>
                Parâmetros para o ano letivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="anoLetivoAtivo"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Ano Letivo Ativo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numeroTrimestres"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Número de Trimestres</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notaMinimaAprovacao"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Nota Mínima</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Financeiro</CardTitle>
              <CardDescription>
                Parâmetros base de cobrança.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="valorPropina"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Propina Base (MT)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
