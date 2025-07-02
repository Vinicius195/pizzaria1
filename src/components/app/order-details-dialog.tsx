'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Order, OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, User, Tag, ShoppingCart, DollarSign, Bike, Store, MapPin, Link as LinkIcon } from 'lucide-react';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadgeClasses = (status: OrderStatus): string => {
    switch (status) {
      case "Recebido":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "Preparando":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      case "Pronto":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "Em Entrega":
        return "bg-primary/10 text-primary border-primary/20";
      case "Entregue":
        return "bg-muted text-muted-foreground border-border";
      case "Cancelado":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Detalhes do Pedido #{order.id}</DialogTitle>
          <DialogDescription>
            Informações completas sobre o pedido.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Cliente</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Horário</span>
            <span className="font-medium">{order.timestamp}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" /> Status</span>
            <Badge variant="outline" className={cn("text-xs", getStatusBadgeClasses(order.status))}>
                {order.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Store className="h-4 w-4" /> Tipo</span>
            <span className="font-medium capitalize flex items-center gap-1.5">
                {order.orderType === 'entrega' ? <Bike className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                {order.orderType === 'entrega' ? 'Entrega' : 'Retirada'}
            </span>
          </div>
          
          {order.orderType === 'entrega' && (order.address || order.locationLink) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium text-muted-foreground"><MapPin className="h-4 w-4" /> Endereço</h4>
                {order.address && (
                  <p className="text-sm text-right">{order.address}</p>
                )}
                {order.locationLink && (
                  <div className="flex justify-end">
                    <Button asChild variant="link" className="h-auto p-0 text-sm">
                      <a
                        href={order.locationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Abrir no mapa
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />
          
          <div>
            <h4 className="flex items-center gap-2 mb-2 font-medium text-muted-foreground"><ShoppingCart className="h-4 w-4" /> Itens</h4>
            <ul className="space-y-1 text-sm list-disc list-inside pl-2">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.productName}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between text-lg font-bold">
            <span className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Total</span>
            <span>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
