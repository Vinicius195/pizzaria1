export type OrderStatus = "Recebido" | "Preparando" | "Pronto" | "Em Entrega" | "Entregue" | "Cancelado";

export type PizzaSize = 'pequeno' | 'medio' | 'grande' | 'GG';

export const pizzaSizes: PizzaSize[] = ['pequeno', 'medio', 'grande', 'GG'];

export interface Product {
  id: string;
  name: string;
  category: 'Pizza' | 'Bebida' | 'Adicional';
  // For items with multiple sizes/volumes like Pizzas and Drinks
  sizes?: Record<string, number>;
  // For simple items with a single price, like Adicionais
  price?: number;
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
  items: { productName: string; quantity: number, size?: string }[];
  total: number;
  status: OrderStatus;
  timestamp: string;
  orderType: 'entrega' | 'retirada';
  address?: string;
  locationLink?: string;
  notes?: string;
};

export type UserRole = 'Administrador' | 'Funcionário';
export type UserStatus = 'Aprovado' | 'Pendente' | 'Reprovado';

export interface UserProfile {
  key: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  fallback: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO string
  isRead: boolean;
  targetRoles: UserRole[];
  link?: string;
}
