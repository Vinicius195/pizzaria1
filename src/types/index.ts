export type OrderStatus = "Recebido" | "Preparando" | "Pronto" | "Em Entrega" | "Entregue" | "Cancelado";

export type PizzaSize = 'pequeno' | 'medio' | 'grande' | 'GG';

export const pizzaSizes: PizzaSize[] = ['pequeno', 'medio', 'grande', 'GG'];

export interface Product {
  id: string;
  name: string;
  category: 'Pizza' | 'Bebida' | 'Adicional';
  price?: number; // For non-pizza items
  sizes?: Partial<Record<PizzaSize, number>>; // For pizza items
  volume?: string; // For drinks, e.g., "2L", "350ml"
  isAvailable: boolean;
  description?: string;
};

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  locationLink?: string;
  lastOrderDate: string;
  totalSpent: number;
  orderCount: number;
};

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: { productName: string; quantity: number, size?: PizzaSize }[];
  total: number;
  status: OrderStatus;
  timestamp: string;
  orderType: 'entrega' | 'retirada';
  address?: string;
  locationLink?: string;
  notes?: string;
};
