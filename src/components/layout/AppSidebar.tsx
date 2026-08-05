"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  School,
  LayoutDashboard,
  Settings,
  Users,
  GraduationCap,
  CreditCard,
  User,
  BookOpen,
  Building,
  BookMarked,
  ClipboardList,
  UserCheck,
  FileText,
  FileCheck2,
  ScrollText,
  ClipboardCheck,
  BarChart3,
  Megaphone,
  History,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

type MenuRole = "ADMIN" | "SECRETARIA" | "TESOURARIA" | "PROFESSOR" | "ALUNO" | "ENCARREGADO";

type MenuItem = {
  title: string;
  url: string;
  icon: any;
  roles: MenuRole[];
};

const menuItems: MenuItem[] = [
  // Admin
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard, roles: ["ADMIN"] },
  { title: "Avisos", url: "/dashboard/admin/avisos", icon: Megaphone, roles: ["ADMIN"] },
  { title: "Auditoria", url: "/dashboard/admin/auditoria", icon: History, roles: ["ADMIN"] },
  { title: "Configurações", url: "/dashboard/admin/configuracoes", icon: Settings, roles: ["ADMIN"] },
  { title: "Alunos", url: "/dashboard/admin/alunos", icon: GraduationCap, roles: ["ADMIN"] },
  { title: "Professores", url: "/dashboard/admin/professores", icon: BookOpen, roles: ["ADMIN"] },
  { title: "Encarregados", url: "/dashboard/admin/encarregados", icon: Users, roles: ["ADMIN"] },
  { title: "Turmas", url: "/dashboard/admin/turmas", icon: Building, roles: ["ADMIN"] },
  { title: "Disciplinas", url: "/dashboard/admin/disciplinas", icon: BookMarked, roles: ["ADMIN"] },
  { title: "Matrículas", url: "/dashboard/admin/matriculas", icon: ClipboardList, roles: ["ADMIN"] },
  { title: "Professor × Turma", url: "/dashboard/admin/professor-turma", icon: UserCheck, roles: ["ADMIN"] },
  { title: "Notas", url: "/dashboard/admin/notas", icon: FileCheck2, roles: ["ADMIN"] },
  { title: "Faltas", url: "/dashboard/admin/faltas", icon: ClipboardCheck, roles: ["ADMIN"] },
  { title: "Boletins", url: "/dashboard/admin/boletins", icon: FileText, roles: ["ADMIN"] },
  { title: "Pautas", url: "/dashboard/admin/pautas", icon: ScrollText, roles: ["ADMIN"] },
  { title: "Financeiro", url: "/dashboard/admin/financeiro", icon: CreditCard, roles: ["ADMIN"] },
  { title: "Relatórios Fin.", url: "/dashboard/admin/financeiro/relatorios", icon: BarChart3, roles: ["ADMIN"] },
  
  // Secretaria
  { title: "Dashboard", url: "/dashboard/secretaria", icon: LayoutDashboard, roles: ["SECRETARIA"] },
  { title: "Avisos", url: "/dashboard/secretaria/avisos", icon: Megaphone, roles: ["SECRETARIA"] },
  { title: "Alunos", url: "/dashboard/secretaria/alunos", icon: GraduationCap, roles: ["SECRETARIA"] },
  { title: "Professores", url: "/dashboard/secretaria/professores", icon: BookOpen, roles: ["SECRETARIA"] },
  { title: "Encarregados", url: "/dashboard/secretaria/encarregados", icon: Users, roles: ["SECRETARIA"] },
  { title: "Turmas", url: "/dashboard/secretaria/turmas", icon: Building, roles: ["SECRETARIA"] },
  { title: "Disciplinas", url: "/dashboard/secretaria/disciplinas", icon: BookMarked, roles: ["SECRETARIA"] },
  { title: "Matrículas", url: "/dashboard/secretaria/matriculas", icon: ClipboardList, roles: ["SECRETARIA"] },
  { title: "Boletins", url: "/dashboard/secretaria/boletins", icon: FileText, roles: ["SECRETARIA"] },
  { title: "Pautas", url: "/dashboard/secretaria/pautas", icon: ScrollText, roles: ["SECRETARIA"] },
  { title: "Financeiro", url: "/dashboard/secretaria/financeiro", icon: CreditCard, roles: ["SECRETARIA"] },

  // Tesouraria
  { title: "Dashboard", url: "/dashboard/tesouraria", icon: LayoutDashboard, roles: ["TESOURARIA"] },
  { title: "Avisos", url: "/dashboard/tesouraria/avisos", icon: Megaphone, roles: ["TESOURARIA"] },
  { title: "Financeiro", url: "/dashboard/tesouraria/financeiro", icon: CreditCard, roles: ["TESOURARIA"] },
  { title: "Relatórios Fin.", url: "/dashboard/tesouraria/relatorios", icon: BarChart3, roles: ["TESOURARIA"] },

  // Professor
  { title: "Dashboard", url: "/dashboard/professor", icon: LayoutDashboard, roles: ["PROFESSOR"] },
  { title: "Avisos", url: "/dashboard/professor/avisos", icon: Megaphone, roles: ["PROFESSOR"] },
  { title: "Notas", url: "/dashboard/professor/notas", icon: FileCheck2, roles: ["PROFESSOR"] },
  { title: "Faltas", url: "/dashboard/professor/faltas", icon: ClipboardCheck, roles: ["PROFESSOR"] },

  // Aluno
  { title: "Dashboard", url: "/dashboard/aluno", icon: LayoutDashboard, roles: ["ALUNO"] },
  { title: "Avisos", url: "/dashboard/aluno/avisos", icon: Megaphone, roles: ["ALUNO"] },
  { title: "Minhas Notas", url: "/dashboard/aluno/notas", icon: FileCheck2, roles: ["ALUNO"] },
  { title: "Minhas Faltas", url: "/dashboard/aluno/faltas", icon: ClipboardCheck, roles: ["ALUNO"] },
  { title: "Meu Boletim", url: "/dashboard/aluno/boletim", icon: FileText, roles: ["ALUNO"] },
  { title: "Financeiro", url: "/dashboard/aluno/financeiro", icon: CreditCard, roles: ["ALUNO"] },

  // Encarregado
  { title: "Dashboard", url: "/dashboard/encarregado", icon: LayoutDashboard, roles: ["ENCARREGADO"] },
  { title: "Avisos", url: "/dashboard/encarregado/avisos", icon: Megaphone, roles: ["ENCARREGADO"] },
  { title: "Notas", url: "/dashboard/encarregado/notas", icon: FileCheck2, roles: ["ENCARREGADO"] },
  { title: "Faltas", url: "/dashboard/encarregado/faltas", icon: ClipboardCheck, roles: ["ENCARREGADO"] },
  { title: "Boletim", url: "/dashboard/encarregado/boletim", icon: FileText, roles: ["ENCARREGADO"] },
  { title: "Financeiro", url: "/dashboard/encarregado/financeiro", icon: CreditCard, roles: ["ENCARREGADO"] },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  if (!session?.user) return null;

  const role = session.user.tipoUsuario as MenuRole;
  const filteredMenu = menuItems.filter((item) => item.roles.includes(role));

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 w-full px-2 py-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-md shrink-0 border shadow-sm bg-white p-0.5">
            <Image src="/logo.jpeg" alt="Escola da Catedral" width={40} height={40} className="object-contain w-full h-full rounded-sm" />
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="font-semibold text-sm truncate">SIGE 2026</span>
            <span className="text-xs text-muted-foreground truncate">Catedral – Beira</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenu.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || (pathname.startsWith(item.url) && item.url !== `/dashboard/${role.toLowerCase()}`)}>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span>Sessão de {role}</span>
          <span className="truncate">{session.user.email}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
