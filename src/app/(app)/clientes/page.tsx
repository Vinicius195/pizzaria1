'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { mockCustomers } from '@/lib/mock-data';
import type { Customer } from '@/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddCustomerDialog, type CustomerFormValues } from '@/components/app/add-customer-dialog';
import { useToast } from '@/hooks/use-toast';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const handleOpenDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: CustomerFormValues) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id ? { ...c, name: data.name, phone: data.phone } : c
      ));
      toast({
        title: 'Cliente Atualizado!',
        description: `As informações de ${data.name} foram atualizadas.`,
      });
    } else {
      const newCustomer: Customer = {
        id: String(Date.now()),
        name: data.name,
        phone: data.phone,
        lastOrderDate: new Date().toISOString().split('T')[0],
        totalSpent: 0,
        orderCount: 0,
      };
      setCustomers(prev => [...prev, newCustomer]);
      toast({
        title: 'Cliente Adicionado!',
        description: `${data.name} foi adicionado à sua lista de clientes.`,
      });
    }
  };

  return (
    <>
      <AddCustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        customer={editingCustomer}
      />
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
                <TableHead>Telefone</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Pedidos</TableHead>
                <TableHead className="hidden md:table-cell">Último Pedido</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">{customer.orderCount}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(customer.lastOrderDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>
                          Editar
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
