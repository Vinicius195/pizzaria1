'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { Customer } from '@/types';
import { MoreHorizontal, PlusCircle, Link as LinkIcon, ExternalLink, History, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AddCustomerDialog, type CustomerFormValues } from '@/components/app/add-customer-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function ClientesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { customers, addOrUpdateCustomer, deleteCustomer } = useUser();

  const handleOpenDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: CustomerFormValues) => {
    await addOrUpdateCustomer({
      id: editingCustomer?.id, // Pass ID if editing
      name: data.name,
      phone: data.phone,
      address: data.addressType === 'manual' ? (data.address || undefined) : undefined,
      locationLink: data.addressType === 'link' ? (data.locationLink || undefined) : undefined,
    });
    
    toast({
      title: editingCustomer ? 'Cliente Atualizado!' : 'Cliente Adicionado!',
      description: `As informações de ${data.name} foram salvas.`,
    });
  };

  const handleViewHistory = (customerName: string) => {
    router.push(`/pedidos?cliente=${encodeURIComponent(customerName)}`);
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    await deleteCustomer(deletingCustomer.id);
    toast({
      variant: 'destructive',
      title: 'Cliente Excluído!',
      description: `O cliente ${deletingCustomer.name} foi removido.`,
    });
    setDeletingCustomer(null);
  };

  return (
    <>
      <AddCustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        customer={editingCustomer}
      />

       <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o cadastro de <span className="font-bold">"{deletingCustomer?.name}"</span>. Os pedidos associados não serão apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: "destructive" })}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Gestão de Clientes</CardTitle>
            <CardDescription>
              Visualize e gerencie as informações dos seus clientes.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="whitespace-nowrap">Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Endereço / Localização</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Pedidos</TableHead>
                <TableHead className="hidden lg:table-cell whitespace-nowrap">Último Pedido</TableHead>
                <TableHead className="text-right whitespace-nowrap">Total Gasto</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{customer.phone}</TableCell>
                   <TableCell className="hidden md:table-cell max-w-[250px]">
                    {customer.address ? (
                        <span className="truncate block" title={customer.address}>{customer.address}</span>
                    ) : customer.locationLink ? (
                        <a
                            href={customer.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80"
                        >
                            <LinkIcon className="h-4 w-4" />
                            Abrir link no mapa
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ) : (
                        'Não informado'
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">{customer.orderCount}</TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap">
                    {new Date(customer.lastOrderDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {customer.totalSpent.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewHistory(customer.name)}>
                           <History className="mr-2 h-4 w-4" />
                           Ver Histórico
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                          onClick={() => setDeletingCustomer(customer)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
