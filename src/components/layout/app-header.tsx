'use client'

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme-toggle';
import { useUser } from '@/contexts/user-context';
import { Badge } from '@/components/ui/badge';
import type { Notification } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  const router = useRouter();
  const title = getPageTitle(pathname);
  const { 
    currentUser, 
    logout, 
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useUser();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!currentUser) {
    return null; 
  }

  const userNotifications = notifications
    .filter(n => (n.targetRoles as unknown as string[]).includes(currentUser.role as string))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification: Notification) => {
    await markNotificationAsRead(notification.id);
    if (notification.link) {
        router.push(notification.link);
    }
  };
  
  const handleMarkAllAsRead = async () => {
      await markAllNotificationsAsRead();
  }

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
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent p-0 text-xs text-accent-foreground">
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 md:w-96">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notificações</span>
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} nova(s)</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[400px]">
              {userNotifications.length > 0 ? (
                userNotifications.map(notification => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "group flex flex-col items-start gap-1 whitespace-normal cursor-pointer",
                      !notification.isRead && "bg-primary/10"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex w-full justify-between items-center">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground group-focus:text-inherit group-focus:opacity-90">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground/80 group-focus:text-inherit group-focus:opacity-70 self-end">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2" />
                    <p>Nenhuma notificação por aqui.</p>
                </div>
              )}
            </ScrollArea>
            {userNotifications.length > 0 && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="justify-center"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Marcar todas como lidas
                    </DropdownMenuItem>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={currentUser.avatar || undefined} alt={`@${currentUser.name}`} data-ai-hint="user avatar" />
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
            <DropdownMenuItem disabled>
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
