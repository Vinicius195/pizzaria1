import type { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type OrderStatus = "Recebido" | "Preparando" | "Pronto" | "Em Entrega" | "Entregue" | "Cancelado";

export type PizzaSize = 'pequeno' | 'medio' | 'grande' | 'GG';

export const pizzaSizes: PizzaSize[] = ['pequeno', 'medio', 'grande', 'GG'];

export type Product = Tables<'products'>;
export type Customer = Tables<'customers'>;
export type Order = Omit<Tables<'orders'>, 'items'> & {
  items: { productName: string; quantity: number; size?: string }[];
};
export type UserProfile = Tables<'profiles'>;
export type Notification = Tables<'notifications'>;
export type PizzaSettings = Tables<'settings'>;

export type UserRole = 'Administrador' | 'Funcionário';
export type UserStatus = 'Aprovado' | 'Pendente' | 'Reprovado';
