import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockOrders } from "@/lib/mock-data";
import type { OrderStatus } from "@/types";
import { Package, ChefHat, Pizza, Bike, CheckCircle, XCircle, DollarSign } from "lucide-react";
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

  const totalRevenue = mockOrders.reduce((acc, order) => order.status === 'Entregue' ? acc + order.total : acc, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento do Dia</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">+12.5% em relação a ontem</p>
          </CardContent>
        </Card>
        {statCards.map(({ status, title, icon: Icon, color }) => (
          <Card key={status} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getOrderCountByStatus(status)}</div>
              <p className="text-xs text-muted-foreground">Total de pedidos</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
                <div>
                  <p className="font-semibold">Pedido #{order.id} - {order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
