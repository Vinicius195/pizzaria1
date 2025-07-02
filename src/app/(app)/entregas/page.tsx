'use client';

import React, { useState } from 'react';
import { mockOrders } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bike, Check, MapPin, Phone, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


export default function EntregasPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>(mockOrders);

    const deliveryOrders = orders.filter(
        order => order.orderType === 'entrega' && (order.status === 'Pronto' || order.status === 'Em Entrega')
    ).sort((a, b) => {
        if (a.status === 'Pronto' && b.status !== 'Pronto') return -1;
        if (a.status !== 'Pronto' && b.status === 'Pronto') return 1;
        return parseInt(a.id, 10) - parseInt(b.id, 10);
    });

    const handleAdvanceStatus = (orderId: string) => {
        let nextStatus: OrderStatus | undefined;

        setOrders(prevOrders =>
            prevOrders.map(order => {
                if (order.id !== orderId) return order;

                if (order.status === 'Pronto') {
                    nextStatus = 'Em Entrega';
                    return { ...order, status: nextStatus };
                }
                if (order.status === 'Em Entrega') {
                    nextStatus = 'Entregue';
                    return { ...order, status: nextStatus };
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
    
    const getStatusBadgeClasses = (status: OrderStatus): string => {
        switch (status) {
          case "Pronto":
            return "bg-chart-2/10 text-chart-2 border-chart-2/20";
          case "Em Entrega":
            return "bg-primary/10 text-primary border-primary/20";
          default:
            return "bg-secondary text-secondary-foreground";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Controle de Entregas</h1>
                <p className="text-muted-foreground">Gerencie os pedidos que estão prontos para sair ou em rota de entrega.</p>
            </div>
            
            {deliveryOrders.length === 0 ? (
                 <Card className="shadow-lg mt-6">
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <Bike className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">Nenhum pedido para entrega no momento</h3>
                            <p className="mt-1 text-sm">Pedidos com status "Pronto" ou "Em Entrega" aparecerão aqui.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {deliveryOrders.map(order => (
                        <Card key={order.id} className="shadow-lg flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline">Pedido #{order.id}</CardTitle>
                                    <Badge variant="outline" className={cn("text-xs", getStatusBadgeClasses(order.status))}>
                                      {order.status}
                                    </Badge>
                                </div>
                                <CardDescription>{order.customerName}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1">
                                {order.customerPhone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{order.customerPhone}</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div className="text-sm">
                                        {order.address ? (
                                            <p>{order.address}</p>
                                        ) : order.locationLink ? (
                                            <a
                                                href={order.locationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80"
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                                Abrir link de localização
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <p className="text-muted-foreground">Endereço não informado.</p>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-1 text-sm">
                                    <h4 className="font-medium">Itens:</h4>
                                    <ul className="list-disc list-inside text-muted-foreground pl-2">
                                    {order.items.map((item, index) => (
                                        <li key={index}>
                                            {item.quantity}x {item.productName} {item.size && <span className='capitalize'>({item.size})</span>}
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleAdvanceStatus(order.id)}>
                                    {order.status === 'Pronto' ? (
                                        <>
                                            <Bike className="mr-2 h-4 w-4" />
                                            Marcar como "Em Entrega"
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Marcar como "Entregue"
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
