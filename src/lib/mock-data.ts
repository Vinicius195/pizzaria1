import type { Product, Order, Customer, OrderStatus } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Pizza de Calabresa', category: 'Pizza', price: 45.50, isAvailable: true, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '2', name: 'Pizza de Quatro Queijos', category: 'Pizza', price: 52.00, isAvailable: true, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '3', name: 'Pizza Portuguesa', category: 'Pizza', price: 55.90, isAvailable: true, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '4', name: 'Coca-Cola 2L', category: 'Bebida', price: 12.00, isAvailable: true, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '5', name: 'Borda de Catupiry', category: 'Adicional', price: 8.00, isAvailable: false, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '6', name: 'Pizza de Frango com Catupiry', category: 'Pizza', price: 49.90, isAvailable: true, imageUrl: 'https://placehold.co/100x100.png' },
  { id: '7', name: 'Guaraná Antarctica 2L', category: 'Bebida', price: 10.00, isAvailable: true, imageUrl: 'https://placehold.co/100x100.png' },
];

export const mockOrders: Order[] = [
  { id: '1001', customerName: 'João Silva', items: [{ productName: 'Pizza de Calabresa', quantity: 2 }], total: 91.00, status: 'Recebido', timestamp: '10:30', orderType: 'retirada' },
  { id: '1002', customerName: 'Maria Oliveira', items: [{ productName: 'Pizza de Quatro Queijos', quantity: 1 }], total: 52.00, status: 'Preparando', timestamp: '10:32', orderType: 'retirada' },
  { id: '1003', customerName: 'Carlos Pereira', items: [{ productName: 'Pizza Portuguesa', quantity: 1 }], total: 55.90, status: 'Pronto', timestamp: '10:35', orderType: 'entrega', address: 'Rua das Gaivotas, 789, Apto 3, Bairro Sol, Florianópolis - SC' },
  { id: '1004', customerName: 'Ana Costa', items: [{ productName: 'Pizza de Frango com Catupiry', quantity: 1 }], total: 49.90, status: 'Em Entrega', timestamp: '10:40', orderType: 'entrega', locationLink: 'https://maps.app.goo.gl/examplelink1' },
  { id: '1005', customerName: 'Lucas Souza', items: [{ productName: 'Coca-Cola 2L', quantity: 1 }], total: 12.00, status: 'Entregue', timestamp: '10:25', orderType: 'retirada' },
  { id: '1006', customerName: 'Mariana Lima', items: [{ productName: 'Pizza de Calabresa', quantity: 1 }, { productName: 'Coca-Cola 2L', quantity: 1 }], total: 57.50, status: 'Preparando', timestamp: '10:42', orderType: 'entrega', address: 'Avenida Beira Mar, 456, Centro, Rio de Janeiro - RJ' },
  { id: '1007', customerName: 'Pedro Almeida', items: [{ productName: 'Pizza de Quatro Queijos', quantity: 1 }], total: 52.00, status: 'Cancelado', timestamp: '10:50', orderType: 'retirada' },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: 'João Silva', phone: '(11) 98765-4321', lastOrderDate: '2024-07-20', totalSpent: 91.00 },
  { id: '2', name: 'Maria Oliveira', phone: '(21) 91234-5678', lastOrderDate: '2024-07-20', totalSpent: 52.00 },
  { id: '3', name: 'Carlos Pereira', phone: '(31) 95555-4444', lastOrderDate: '2024-07-19', totalSpent: 110.50 },
  { id: '4', name: 'Ana Costa', phone: '(41) 98888-7777', lastOrderDate: '2024-07-18', totalSpent: 230.00 },
];

export const orderStatuses: OrderStatus[] = ["Recebido", "Preparando", "Pronto", "Em Entrega", "Entregue", "Cancelado"];
