"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Lock, Mail, Loader2 } from "lucide-react";
import Image from "next/image";

import { loginSchema, LoginInput } from "@/src/validators/auth.schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      // 1. Autenticar sessão na NextAuth Client (Valida e gera o token)
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("E-mail ou palavra-passe incorretos.");
        setIsLoading(false);
        return;
      }

      toast.success("Sessão iniciada com sucesso!");

      // 2. Redirecionar para o dashboard (o Middleware fará o encaminhamento final)
      const targetUrl = callbackUrl || "/dashboard";
      router.push(targetUrl);
      router.refresh();
    } catch (error) {
      console.error("Erro durante o processo de login:", error);
      toast.error("Ocorreu um erro ao comunicar com o servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      
      {/* Background Decorativo Dinâmico (Orbs em movimento suave) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/20 blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-sky-300/20 blur-[80px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }} />

      <div className="relative z-10 w-full max-w-md space-y-8">
        
        {/* Cabeçalho da Instituição */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-36 h-36 rounded-[2rem] shadow-2xl shadow-blue-900/10 border-4 border-white bg-white mb-2 mx-auto p-2 transition-transform hover:scale-105 duration-500 hover:rotate-3 cursor-default">
            <Image src="/logo.jpeg" alt="Escola da Catedral" width={128} height={128} className="object-contain w-full h-full rounded-xl" priority />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Escola Da Catedral
            </h1>
            <p className="text-sm font-medium text-blue-600 mt-1">
              Beira — Moçambique
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Sistema Integrado de Gestão Escolar (SIGE)
          </p>
        </div>

        {/* Card do Formulário de Login (Glassmorphism Light) */}
        <Card className="bg-white/70 border-white backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 border-b border-slate-100/50 bg-white/40">
            <CardTitle className="text-xl text-center text-slate-800 font-semibold">
              Iniciar Sessão
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Introduza as suas credenciais de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Endereço de E-mail
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="utilizador@catedral.co.mz"
                    disabled={isLoading}
                    className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl transition-all"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Campo Palavra-passe */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Palavra-passe
                  </Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl transition-all"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Botão Entrar */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    A autenticar...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rodapé institucional */}
        <p className="text-center text-xs font-medium text-slate-400">
          &copy; 2026 Escola Da Catedral – Beira. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-slate-900"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
