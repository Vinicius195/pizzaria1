'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockOrders, orderStatuses, mockProducts } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/types';
import { Clock, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddOrderDialog, type AddOrderFormValues } from '@/components/app/add-order-dialog';
import { OrderDetailsDialog } from '@/components/app/order-details-dialog';
import { useToast } from '@/hooks/use-toast';

function OrderCard({ 
  order, 
  onAdvanceStatus, 
  onViewDetails 
}: { 
  order: Order; 
  onAdvanceStatus: (orderId: string) => void; 
  onViewDetails: (order: Order) => void; 
}) {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Recebido': return 'border-chart-3';
      case 'Preparando': return 'border-chart-4';
      case 'Pronto': return 'border-chart-2';
      case 'Em Entrega': return 'border-primary';
      case 'Entregue': return 'border-border';
      case 'Cancelado': return 'border-destructive';
      default: return 'border-border';
    }
  }

  const isActionDisabled = order.status === 'Entregue' || order.status === 'Cancelado';

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${getStatusColor(order.status)}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline">Pedido #{order.id}</CardTitle>
            <CardDescription>{order.customerName}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{order.timestamp}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.quantity}x {item.productName}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-3" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onViewDetails(order)}>Ver Detalhes</Button>
        <Button 
          className="bg-accent hover:bg-accent/90"
          onClick={() => onAdvanceStatus(order.id)}
          disabled={isActionDisabled}
        >
          Avançar Status
        </Button>
      </CardFooter>
    </Card>
  );
}

function PedidosPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const statusFilter = searchParams.get('status');
  
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const allTabs = ['Todos', ...orderStatuses];
  const defaultValue = statusFilter && allTabs.includes(statusFilter) ? statusFilter : 'Todos';

  const handleAdvanceStatus = (orderId: string) => {
    const orderToUpdate = orders.find((o) => o.id === orderId);
    if (!orderToUpdate) return;

    const currentStatusIndex = orderStatuses.indexOf(orderToUpdate.status);
    if (orderToUpdate.status === 'Entregue' || orderToUpdate.status === 'Cancelado' || currentStatusIndex === -1) {
      return;
    }

    const nextStatusIndex = currentStatusIndex + 1;
    if (nextStatusIndex < orderStatuses.length) {
      const nextStatus = orderStatuses[nextStatusIndex];
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: nextStatus } : order
        )
      );
      
      if (nextStatus !== 'Cancelado') {
        toast({
          title: "Status do Pedido Atualizado!",
          description: `O pedido #${orderId} agora está: ${nextStatus}.`,
        });
      }
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleAddOrder = (data: AddOrderFormValues) => {
    const newOrderItems = data.items.map(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      return {
        productName: product?.name || 'Produto Desconhecido',
        quantity: item.quantity,
        price: product?.price || 0,
      };
    });

    const total = newOrderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrder: Order = {
      id: String(Date.now()).slice(-4),
      customerName: data.customerName,
      items: newOrderItems.map(({ productName, quantity }) => ({ productName, quantity })),
      total: total,
      status: 'Recebido',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  return (
    <>
      <AddOrderDialog 
        open={isAddOrderDialogOpen} 
        onOpenChange={setIsAddOrderDialogOpen}
        onAddOrder={handleAddOrder}
      />
      <OrderDetailsDialog 
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Pedidos</h1>
        <Button onClick={() => setIsAddOrderDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Pedido
        </Button>
      </div>
      <Tabs defaultValue={defaultValue} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          {orderStatuses.map(status => (
            <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="Todos" className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onAdvanceStatus={handleAdvanceStatus} 
              onViewDetails={handleViewDetails} 
            />
          ))}
        </TabsContent>
        {orderStatuses.map(status => (
          <TabsContent key={status} value={status} className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.filter(order => order.status === status).map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onAdvanceStatus={handleAdvanceStatus} 
                onViewDetails={handleViewDetails} 
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

function PedidosPageSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[250px] w-full" />
        ))}
      </div>
    </div>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={<PedidosPageSkeleton />}>
      <PedidosPageContent />
    </Suspense>
  )
}
