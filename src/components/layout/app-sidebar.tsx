'use client';

import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Pizza, Home, ClipboardList, Users, Settings, LifeBuoy, Bike } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/user-context';

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['Administrador'] },
  { href: '/pedidos', label: 'Pedidos', icon: ClipboardList, roles: ['Administrador', 'Funcionário'] },
  { href: '/entregas', label: 'Entregas', icon: Bike, roles: ['Administrador', 'Funcionário'] },
  { href: '/produtos', label: 'Produtos', icon: Pizza, roles: ['Administrador', 'Funcionário'] },
  { href: '/clientes', label: 'Clientes', icon: Users, roles: ['Administrador'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser } = useUser();

  if (!currentUser) {
    return null;
  }

  const menuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 justify-center group-data-[collapsible=icon]:justify-start">
          <Pizza className="h-8 w-8 text-primary" />
          <h2 className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
            Bela Massa
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {currentUser.role === 'Administrador' && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/configuracoes')} tooltip="Configurações">
                <Link href="/configuracoes">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Ajuda">
                <LifeBuoy />
                <span>Ajuda</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
