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
import type { Order, OrderStatus, PizzaSize, Product } from '@/types';
import { Clock, PlusCircle, Bike, MoreHorizontal, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddOrderDialog, type AddOrderFormValues } from '@/components/app/add-order-dialog';
import { OrderDetailsDialog } from '@/components/app/order-details-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

function OrderCard({ 
  order, 
  onAdvanceStatus, 
  onViewDetails,
  onCancelOrder
}: { 
  order: Order; 
  onAdvanceStatus: (orderId: string) => void; 
  onViewDetails: (order: Order) => void; 
  onCancelOrder: (orderId: string) => void; 
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
            {order.orderType === 'entrega' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Bike className="h-5 w-5 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pedido para Entrega</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Clock className="h-4 w-4" />
            <span>{order.timestamp}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.quantity}x {item.productName} {item.size && <span className='capitalize'>({item.size})</span>}</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onAdvanceStatus(order.id)}
              disabled={isActionDisabled}
            >
              Avançar Status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => onCancelOrder(order.id)}
              disabled={isActionDisabled}
            >
              Cancelar Pedido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

function PedidosPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const statusFilter = searchParams.get('status');
  
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => 
    mockOrders.slice().sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allTabs = ['Todos', ...orderStatuses];
  const defaultValue = statusFilter && allTabs.includes(statusFilter) ? statusFilter : 'Todos';

  const handleAdvanceStatus = (orderId: string) => {
    let nextStatus: OrderStatus | undefined;

    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id !== orderId) return order;

        const currentStatusIndex = orderStatuses.indexOf(order.status);
        const isActionable = order.status !== 'Entregue' && order.status !== 'Cancelado' && currentStatusIndex !== -1;

        if (!isActionable) return order;

        // Skip "Em Entrega" for pickup orders
        if (order.status === 'Pronto' && order.orderType === 'retirada') {
          nextStatus = 'Entregue';
          return { ...order, status: 'Entregue' };
        }

        // Default advancement
        const nextStatusIndex = currentStatusIndex + 1;
        if (nextStatusIndex < orderStatuses.length) {
          const potentialNextStatus = orderStatuses[nextStatusIndex];
          if (potentialNextStatus !== 'Cancelado') {
            nextStatus = potentialNextStatus;
            return { ...order, status: nextStatus };
          }
        }

        return order;
      })
    );

    if (nextStatus) {
      toast({
        title: "Status do Pedido Atualizado!",
        description: `O pedido #${orderId} agora está: ${nextStatus}.`,
      });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'Cancelado' } : order
      )
    );
    toast({
      variant: "destructive",
      title: "Pedido Cancelado!",
      description: `O pedido #${orderId} foi cancelado.`,
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };
  
  const getProductDisplayName = (p: Product) => {
    if (p.category === 'Bebida' && p.volume) {
        return `${p.name} ${p.volume}`;
    }
    return p.name;
  };

  const handleAddOrder = (data: AddOrderFormValues) => {
    const orderItemsWithDetails = data.items.map(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        if (!product) return null;

        let price = 0;
        if (product.category === 'Pizza' && item.size && product.sizes) {
            price = product.sizes[item.size] || 0;
        } else if (product.price) {
            price = product.price;
        }

        return {
            productName: getProductDisplayName(product),
            quantity: item.quantity,
            size: item.size,
            price: price,
        };
    }).filter(Boolean);


    const total = orderItemsWithDetails.reduce((acc, item) => acc + (item!.price * item!.quantity), 0);
    const newOrderId = String(Math.max(0, ...orders.map(o => parseInt(o.id, 10))) + 1);

    const newOrder: Order = {
        id: newOrderId,
        customerName: data.customerName,
        items: orderItemsWithDetails.map(({ productName, quantity, size }) => ({ productName, quantity, size: size as PizzaSize | undefined })),
        total,
        status: 'Recebido',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        orderType: data.orderType,
        address: data.address,
        locationLink: data.locationLink,
    };

    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold font-headline">Pedidos</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddOrderDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Pedido
          </Button>
        </div>
      </div>
      <Tabs defaultValue={defaultValue} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          {orderStatuses.map(status => (
            <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="Todos" className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onAdvanceStatus={handleAdvanceStatus} 
              onViewDetails={handleViewDetails}
              onCancelOrder={handleCancelOrder}
            />
          ))}
        </TabsContent>
        {orderStatuses.map(status => (
          <TabsContent key={status} value={status} className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrders.filter(order => order.status === status).map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onAdvanceStatus={handleAdvanceStatus} 
                onViewDetails={handleViewDetails}
                onCancelOrder={handleCancelOrder}
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
