'use client';

import React, { Suspense } from 'react';
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
import { mockOrders, orderStatuses } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/types';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function OrderCard({ order }: { order: Order }) {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Recebido': return 'border-blue-500';
      case 'Preparando': return 'border-yellow-500';
      case 'Pronto': return 'border-green-500';
      case 'Em Entrega': return 'border-purple-500';
      case 'Entregue': return 'border-gray-500';
      case 'Cancelado': return 'border-red-500';
      default: return 'border-primary';
    }
  }

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
        <Button variant="outline">Ver Detalhes</Button>
        <Button className="bg-accent hover:bg-accent/90">Avançar Status</Button>
      </CardFooter>
    </Card>
  );
}

function PedidosPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  
  const allTabs = ['Todos', ...orderStatuses];
  const defaultValue = statusFilter && allTabs.includes(statusFilter) ? statusFilter : 'Todos';

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
        <TabsTrigger value="Todos">Todos</TabsTrigger>
        {orderStatuses.map(status => (
          <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="Todos" className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockOrders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </TabsContent>
      {orderStatuses.map(status => (
        <TabsContent key={status} value={status} className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockOrders.filter(order => order.status === status).map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </TabsContent>
      ))}
    </Tabs>
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
