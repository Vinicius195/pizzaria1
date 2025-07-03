'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { pizzaSizes, type UserProfile, type UserStatus, type PizzaSettings } from '@/types';
import { useUser } from '@/contexts/user-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditUserDialog } from '@/components/app/edit-user-dialog';

const settingsSchema = z.object({
  basePrices: z.object({
    pequeno: z.coerce.number().min(0, "O preço deve ser positivo."),
    medio: z.coerce.number().min(0, "O preço deve ser positivo."),
    grande: z.coerce.number().min(0, "O preço deve ser positivo."),
    GG: z.coerce.number().min(0, "O preço deve ser positivo."),
  }),
  sizeAvailability: z.object({
    pequeno: z.boolean(),
    medio: z.boolean(),
    grande: z.boolean(),
    GG: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function getStatusBadgeClasses(status: UserStatus | null): string {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'Pendente':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'Reprovado':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
}

export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const { currentUser, users, updateUserStatus, deleteUser, settings, updateSettings } = useUser();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      basePrices: { pequeno: 0, medio: 0, grande: 0, GG: 0 },
      sizeAvailability: { pequeno: false, medio: false, grande: false, GG: false },
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        basePrices: settings.basePrices as any,
        sizeAvailability: settings.sizeAvailability as any,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    await updateSettings(data as PizzaSettings);
    toast({
      title: 'Configurações Salvas!',
      description: 'Suas alterações foram salvas com sucesso.',
    });
  };
  
  const handleUpdateStatus = async (user: UserProfile, status: UserStatus) => {
    if (!user.id) return;
    await updateUserStatus(user.id, status);
    toast({
        title: 'Usuário Atualizado!',
        description: `O status de ${user.name} foi alterado para ${status}.`,
    });
  };

  const handleDeleteUser = async () => {
    if (!deletingUser || !deletingUser.id) return;
    await deleteUser(deletingUser.id);
    toast({
      title: 'Usuário Excluído!',
      description: `O usuário ${deletingUser.name} foi removido.`,
    });
    setDeletingUser(null);
  };

  return (
    <>
      <EditUserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
      />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a conta de <span className="font-bold">"{deletingUser?.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className={buttonVariants({ variant: "destructive" })}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações gerais e usuários da sua pizzaria.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                  Aprove ou reprove novos cadastros e visualize todos os usuários do sistema.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="hidden sm:table-cell">Email</TableHead>
                          <TableHead className="hidden md:table-cell">Função</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {users.map(user => (
                          <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                              <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                              <TableCell className="text-center">
                                  <Badge variant="outline" className={cn('text-xs', getStatusBadgeClasses(user.status))}>
                                    {user.status}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {user.status === 'Pendente' ? (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleUpdateStatus(user, 'Aprovado')}>
                                            <Check className="h-4 w-4" />
                                            <span className="sr-only">Aprovar</span>
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleUpdateStatus(user, 'Reprovado')}>
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Reprovar</span>
                                        </Button>
                                    </div>
                                ) : user.id === currentUser?.id ? (
                                    <Badge variant="outline" className="font-medium">Você</Badge>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Opções do usuário</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            {user.status === 'Aprovado' && (
                                                <>
                                                    <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Editar</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            <DropdownMenuItem
                                                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                                onClick={() => setDeletingUser(user)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Excluir</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
        </Card>


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Preços Base das Pizzas</CardTitle>
                <CardDescription>
                  Defina os preços padrão para cada tamanho de pizza. Eles serão usados como sugestão ao criar um novo produto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {pizzaSizes.map((size) => (
                    <FormField
                      key={size}
                      control={form.control}
                      name={`basePrices.${size}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize font-medium">{size}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">R$</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                className="pl-8"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Disponibilidade de Tamanhos</CardTitle>
                <CardDescription>
                  Ative ou desative tamanhos de pizza para todo o cardápio. Isso afetará as opções ao criar um novo pedido.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {pizzaSizes.map((size) => (
                    <FormField
                      key={size}
                      control={form.control}
                      name={`sizeAvailability.${size}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start gap-4 rounded-lg border p-4 shadow-sm h-full">
                          <FormLabel className="text-base font-semibold capitalize cursor-pointer">
                            {size}
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label={`Disponibilidade do tamanho ${size}`}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
