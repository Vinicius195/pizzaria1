'use client'

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Users, Bike } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/pedidos')) return 'Pedidos';
  if (pathname.startsWith('/produtos')) return 'Produtos';
  if (pathname.startsWith('/clientes')) return 'Clientes';
  return 'PizzaFast Manager';
};

type UserProfile = {
  name: string;
  email: string;
  role: 'Administrador' | 'Garçom' | 'Entregador';
  avatar: string;
  fallback: string;
};

const userProfiles: Record<string, UserProfile> = {
  admin: { name: 'Administrador', email: 'admin@pizzafast.com', role: 'Administrador', avatar: 'https://placehold.co/40x40.png', fallback: 'A' },
  waiter: { name: 'Garçom', email: 'garcom@pizzafast.com', role: 'Garçom', avatar: 'https://placehold.co/40x40.png', fallback: 'G' },
  delivery: { name: 'Entregador', email: 'entregador@pizzafast.com', role: 'Entregador', avatar: 'https://placehold.co/40x40.png', fallback: 'E' },
};


export function AppHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const [currentUserKey, setCurrentUserKey] = useState('admin');
  const currentUser = userProfiles[currentUserKey];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-headline text-xl font-semibold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={currentUser.avatar} alt={`@${currentUser.name}`} data-ai-hint="user avatar" />
                <AvatarFallback>{currentUser.fallback}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuLabel>Trocar de Conta</DropdownMenuLabel>
             <DropdownMenuItem onClick={() => setCurrentUserKey('admin')}>
              <User className="mr-2 h-4 w-4" />
              <span>Administrador</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentUserKey('waiter')}>
              <Users className="mr-2 h-4 w-4" />
              <span>Garçom</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentUserKey('delivery')}>
              <Bike className="mr-2 h-4 w-4" />
              <span>Entregador</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
