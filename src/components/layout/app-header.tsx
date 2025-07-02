'use client'

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Users, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../theme-toggle';
import { useUser, userProfiles } from '@/contexts/user-context';

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/pedidos')) return 'Pedidos';
  if (pathname.startsWith('/entregas')) return 'Entregas';
  if (pathname.startsWith('/produtos')) return 'Produtos';
  if (pathname.startsWith('/clientes')) return 'Clientes';
  if (pathname.startsWith('/configuracoes')) return 'Configurações';
  return 'Pizzaria Bela Massa';
};

export function AppHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { currentUser, setCurrentUser } = useUser();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-headline text-xl font-semibold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
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
            {currentUser.role === 'Administrador' && (
              <DropdownMenuItem asChild>
                <Link href="/configuracoes">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
             <DropdownMenuLabel>Trocar de Usuário</DropdownMenuLabel>
             {Object.values(userProfiles).map(profile => (
              <DropdownMenuItem key={profile.key} onClick={() => setCurrentUser(profile.key)} disabled={currentUser.key === profile.key}>
                {profile.role === 'Administrador' ? <UserCog className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
                <span>{profile.name}</span>
              </DropdownMenuItem>
             ))}
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
