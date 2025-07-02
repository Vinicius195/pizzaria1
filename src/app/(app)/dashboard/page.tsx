'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockOrders } from "@/lib/mock-data";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Package, ChefHat, Pizza, Bike, CheckCircle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCard = {
  status: OrderStatus;
  title: string;
  icon: LucideIcon;
  color: string;
};

const statCards: StatCard[] = [
  { status: "Recebido", title: "Pedidos Recebidos", icon: Package, color: "text-chart-3" },
  { status: "Preparando", title: "Em Preparo", icon: ChefHat, color: "text-chart-4" },
  { status: "Pronto", title: "Prontos para Entrega", icon: Pizza, color: "text-chart-2" },
  { status: "Em Entrega", title: "Em Rota de Entrega", icon: Bike, color: "text-primary" },
  { status: "Entregue", title: "Pedidos Entregues", icon: CheckCircle, color: "text-muted-foreground" },
  { status: "Cancelado", title: "Pedidos Cancelados", icon: XCircle, color: "text-destructive" },
];

export default function DashboardPage() {
  const getOrderCountByStatus = (status: OrderStatus) => {
    return mockOrders.filter(order => order.status === status).length;
  };

  const totalRevenue = mockOrders
    .filter(order => order.status !== 'Cancelado')
    .reduce((acc, order) => acc + order.total, 0);

  const totalOrders = mockOrders.length;

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Potencial do Dia</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">Soma de todos os pedidos não cancelados</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-2">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+5% em relação a ontem</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ status, title, icon: Icon, color }) => (
          <Card key={status} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className={cn("h-4 w-4", color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getOrderCountByStatus(status)}</div>
               <p className="text-xs text-muted-foreground">Total de pedidos neste status</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.slice(0, 5).map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {order.customerName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {order.items.map(i => i.productName).join(', ')}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn("border text-xs", getStatusBadgeClasses(order.status))}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}