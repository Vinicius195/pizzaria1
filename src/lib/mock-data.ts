import type { Product, Order, Customer, OrderStatus, PizzaSize } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Pizza de Calabresa', category: 'Pizza', sizes: { pequeno: 35.50, medio: 45.50, grande: 55.50 }, isAvailable: true, description: 'Molho de tomate, mussarela, calabresa e orégano.' },
  { id: '2', name: 'Pizza de Quatro Queijos', category: 'Pizza', sizes: { pequeno: 42.00, medio: 52.00, grande: 62.00, GG: 72.00 }, isAvailable: true, description: 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.' },
  { id: '3', name: 'Pizza Portuguesa', category: 'Pizza', sizes: { medio: 55.90, grande: 65.90 }, isAvailable: true, description: 'Mussarela, presunto, ovos, cebola, pimentão e azeitonas.' },
  { id: '4', name: 'Coca-Cola 2L', category: 'Bebida', price: 12.00, isAvailable: true },
  { id: '5', name: 'Borda de Catupiry', category: 'Adicional', price: 8.00, isAvailable: false },
  { id: '6', name: 'Pizza de Frango com Catupiry', category: 'Pizza', sizes: { medio: 49.90, grande: 59.90 }, isAvailable: true, description: 'Molho de tomate, mussarela, frango desfiado e catupiry.' },
  { id: '7', name: 'Guaraná Antarctica 2L', category: 'Bebida', price: 12.00, isAvailable: true },
  { id: '8', name: 'Fanta Laranja 2L', category: 'Bebida', price: 12.00, isAvailable: false },
  { id: '9', name: 'Coca-Cola Lata 350ml', category: 'Bebida', price: 6.00, isAvailable: true },
  { id: '10', name: 'Guaraná Lata 350ml', category: 'Bebida', price: 6.00, isAvailable: true },
  { id: '11', name: 'Água Mineral 500ml', category: 'Bebida', price: 4.00, isAvailable: true },
];

export const mockOrders: Order[] = [
  { id: '1001', customerName: 'João Silva', items: [{ productName: 'Pizza de Calabresa', quantity: 2, size: 'medio' }], total: 91.00, status: 'Recebido', timestamp: '10:30', orderType: 'retirada' },
  { id: '1002', customerName: 'Maria Oliveira', items: [{ productName: 'Pizza de Quatro Queijos', quantity: 1, size: 'grande' }], total: 62.00, status: 'Preparando', timestamp: '10:32', orderType: 'retirada' },
  { id: '1003', customerName: 'Carlos Pereira', items: [{ productName: 'Pizza Portuguesa', quantity: 1, size: 'medio' }], total: 55.90, status: 'Pronto', timestamp: '10:35', orderType: 'entrega', address: 'Rua das Gaivotas, 789, Apto 3, Bairro Sol, Florianópolis - SC' },
  { id: '1004', customerName: 'Ana Costa', items: [{ productName: 'Pizza de Frango com Catupiry', quantity: 1, size: 'grande' }], total: 59.90, status: 'Em Entrega', timestamp: '10:40', orderType: 'entrega', locationLink: 'https://maps.app.goo.gl/examplelink1' },
  { id: '1005', customerName: 'Coca-Cola 2L', items: [{ productName: 'Coca-Cola 2L', quantity: 1 }], total: 12.00, status: 'Entregue', timestamp: '10:25', orderType: 'retirada' },
  { id: '1006', customerName: 'Mariana Lima', items: [{ productName: 'Pizza de Calabresa', quantity: 1, size: 'pequeno' }, { productName: 'Coca-Cola 2L', quantity: 1 }], total: 47.5, status: 'Preparando', timestamp: '10:42', orderType: 'entrega', address: 'Avenida Beira Mar, 456, Centro, Rio de Janeiro - RJ' },
  { id: '1007', customerName: 'Pedro Almeida', items: [{ productName: 'Pizza de Quatro Queijos', quantity: 1, size: 'GG' }], total: 72.00, status: 'Cancelado', timestamp: '10:50', orderType: 'retirada' },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: 'João Silva', phone: '(11) 98765-4321', lastOrderDate: '2024-07-20', totalSpent: 91.00 },
  { id: '2', name: 'Maria Oliveira', phone: '(21) 91234-5678', lastOrderDate: '2024-07-20', totalSpent: 62.00 },
  { id: '3', name: 'Carlos Pereira', phone: '(31) 95555-4444', lastOrderDate: '2024-07-19', totalSpent: 110.50 },
  { id: '4', name: 'Ana Costa', phone: '(41) 98888-7777', lastOrderDate: '2024-07-18', totalSpent: 230.00 },
];

export const orderStatuses: OrderStatus[] = ["Recebido", "Preparando", "Pronto", "Em Entrega", "Entregue", "Cancelado"];