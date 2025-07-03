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
import { mockOrders, orderStatuses, mockProducts } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/types';
import { Clock, PlusCircle, Bike, MoreHorizontal, Search, MessageSquare, ChefHat, Pizza as PizzaIcon, Package } from 'lucide-react';
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
import { useUser } from '@/contexts/user-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { currentUser } = useUser();
  const isManager = currentUser?.role === 'Administrador';

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
    <Card className={`shadow-md hover:shadow-lg transition-shadow border-l-4 bg-card ${getStatusColor(order.status)} flex flex-col`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-base">Pedido #{order.id}</CardTitle>
            <CardDescription>{order.customerName}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {order.notes && (
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Contém observações</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
      <CardContent className="py-2 flex-1">
        <ul className="space-y-1 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span className="truncate">{item.quantity}x {item.productName} {item.size && <span className='capitalize'>({item.size})</span>}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-3 border-t">
        <div>
          <span className="text-muted-foreground text-xs">Total</span>
          <p className="font-bold text-base">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>Detalhes</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
              {isManager && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onClick={() => onCancelOrder(order.id)}
                    disabled={isActionDisabled}
                  >
                    Cancelar Pedido
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}

const kanbanStatuses: { status: OrderStatus, icon: React.ElementType, color: string }[] = [
    { status: "Recebido", icon: Package, color: "bg-chart-3" },
    { status: "Preparando", icon: ChefHat, color: "bg-chart-4" },
    { status: "Pronto", icon: PizzaIcon, color: "bg-chart-2" },
];


function PedidosPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { currentUser, addOrUpdateCustomer } = useUser();
  const isMobile = useIsMobile();
  const statusFilter = searchParams.get('status');
  
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => 
    mockOrders.slice().sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allTabs = ['Todos', ...orderStatuses];
  const defaultValue = statusFilter && allTabs.includes(statusFilter) ? statusFilter : 'Todos';

  if (!currentUser) {
    return <PedidosPageSkeleton />;
  }
  const isManager = currentUser.role === 'Administrador';

  const handleAdvanceStatus = (orderId: string) => {
    let nextStatus: OrderStatus | undefined;

    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id !== orderId) return order;

        const currentStatusIndex = orderStatuses.indexOf(order.status);
        const isActionable = order.status !== 'Entregue' && order.status !== 'Cancelado' && currentStatusIndex !== -1;

        if (!isActionable) return order;

        if (order.status === 'Pronto' && order.orderType === 'retirada') {
          nextStatus = 'Entregue';
          return { ...order, status: 'Entregue' };
        }
        
        if (order.status === 'Pronto' && order.orderType === 'entrega') {
          nextStatus = 'Em Entrega';
          return { ...order, status: 'Em Entrega' };
        }

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

  const handleAddOrder = (data: AddOrderFormValues) => {
    const orderItemsWithDetails = data.items.map(item => {
        const product1 = mockProducts.find(p => p.id === item.productId);
        if (!product1) return null;

        if (item.isHalfHalf && item.size) {
            const product2 = mockProducts.find(p => p.id === item.product2Id);
            if (!product2) return null;

            const price1 = product1.sizes?.[item.size] ?? 0;
            const price2 = product2.sizes?.[item.size] ?? 0;
            const finalPrice = Math.max(price1, price2);

            return {
                productName: `Meio a Meio: ${product1.name} / ${product2.name}`,
                quantity: item.quantity,
                size: item.size,
                price: finalPrice,
            };
        }
        
        const price = (product1.sizes && item.size) 
            ? product1.sizes[item.size] || 0
            : product1.price || 0;

        return {
            productName: product1.name,
            quantity: item.quantity,
            size: item.size,
            price: price,
        };
    }).filter((item): item is NonNullable<typeof item> => item !== null);


    const total = orderItemsWithDetails.reduce((acc, item) => acc + (item!.price * item!.quantity), 0);
    const newOrderId = String(Math.max(0, ...orders.map(o => parseInt(o.id, 10))) + 1);

    const newOrder: Order = {
        id: newOrderId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        items: orderItemsWithDetails.map(({ productName, quantity, size }) => ({ productName, quantity, size })),
        total,
        status: 'Recebido',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        orderType: data.orderType,
        address: data.address,
        locationLink: data.locationLink,
        notes: data.notes,
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);

    // Integrate with customer data
    addOrUpdateCustomer({
        name: newOrder.customerName,
        phone: newOrder.customerPhone || '',
        address: newOrder.address,
        locationLink: newOrder.locationLink,
        orderTotal: newOrder.total,
    });
  };

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || order.id.includes(searchQuery)
  );

  const ordersByStatus = (status: OrderStatus) => {
    return filteredOrders.filter((order: Order) => order.status === status);
  };
  
  function KanbanSkeleton() {
    return (
      <div className="w-full overflow-x-auto pb-4">
        <div className="grid grid-flow-col auto-cols-fr md:auto-cols-auto gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full md:w-[320px] lg:w-[350px] flex-shrink-0 space-y-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-44 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              placeholder="Buscar cliente ou nº do pedido..."
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
      
      {isManager ? (
        <Tabs defaultValue={defaultValue} className="w-full">
            <TabsList className="h-auto flex-wrap">
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
      ) : (
        <>
          {isMobile === undefined && <KanbanSkeleton />}
          {isMobile === true && (
            <Tabs defaultValue={kanbanStatuses[0].status} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border-b gap-1">
                {kanbanStatuses.map(({ status, icon: Icon }) => (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className="flex flex-col h-auto p-2 gap-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-semibold">{status}</span>
                    </div>
                    <Badge
                      className={cn(
                        "w-6 h-6 flex items-center justify-center p-0 rounded-full text-xs",
                        ordersByStatus(status).length > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {ordersByStatus(status).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              {kanbanStatuses.map(({ status, icon: Icon }) => (
                <TabsContent key={status} value={status} className="mt-4 grid gap-4">
                  {ordersByStatus(status).length > 0 ? (
                    ordersByStatus(status).map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onAdvanceStatus={handleAdvanceStatus}
                        onViewDetails={handleViewDetails}
                        onCancelOrder={handleCancelOrder}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 rounded-md text-sm text-muted-foreground bg-muted/20">
                      <Icon className="h-16 w-16 text-muted-foreground/30" />
                      <p className="mt-4 font-medium">Nenhum pedido em "{status}"</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
          {isMobile === false && (
            <div className="w-full overflow-x-auto pb-4">
              <div className="grid grid-flow-col auto-cols-fr md:auto-cols-auto gap-6">
                  {kanbanStatuses.map(({status, icon: Icon, color}) => (
                      <div key={status} className="w-full md:w-[320px] lg:w-[350px] flex-shrink-0">
                          <div className={cn("flex items-center justify-between p-3 rounded-t-lg text-white", color)}>
                              <div className="flex items-center gap-2">
                                  <Icon className="h-5 w-5" />
                                  <h2 className="font-headline font-semibold text-lg">{status}</h2>
                              </div>
                              <Badge className="bg-white/20 text-white hover:bg-white/30">{ordersByStatus(status).length}</Badge>
                          </div>
                          <div className="h-full min-h-[calc(100vh-320px)] bg-muted/40 rounded-b-lg p-3 space-y-4">
                              {ordersByStatus(status).length > 0 ? (
                                  ordersByStatus(status).map((order) => (
                                      <OrderCard
                                          key={order.id}
                                          order={order}
                                          onAdvanceStatus={handleAdvanceStatus}
                                          onViewDetails={handleViewDetails}
                                          onCancelOrder={handleCancelOrder}
                                      />
                                  ))
                              ) : (
                                  <div className="flex flex-col items-center justify-center h-48 rounded-md text-sm text-muted-foreground">
                                      <Icon className="h-12 w-12 text-muted-foreground/30" />
                                      <p className="mt-4">Nenhum pedido aqui.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
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
