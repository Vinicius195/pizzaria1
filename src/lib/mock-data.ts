import type { Product, Order, Customer, OrderStatus, PizzaSize } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Pizza de Calabresa', category: 'Pizza', sizes: { pequeno: 35.50, medio: 45.50, grande: 55.50 }, isAvailable: true, description: 'Molho de tomate, mussarela, calabresa e orégano.' },
  { id: '2', name: 'Pizza de Quatro Queijos', category: 'Pizza', sizes: { pequeno: 42.00, medio: 52.00, grande: 62.00, GG: 72.00 }, isAvailable: true, description: 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola.' },
  { id: '3', name: 'Pizza Portuguesa', category: 'Pizza', sizes: { medio: 55.90, grande: 65.90 }, isAvailable: true, description: 'Mussarela, presunto, ovos, cebola, pimentão e azeitonas.' },
  { id: '4', name: 'Coca-Cola', category: 'Bebida', price: 12.00, volume: '2L', isAvailable: true },
  { id: '5', name: 'Borda de Catupiry', category: 'Adicional', price: 8.00, isAvailable: true },
  { id: '12', name: 'Borda de Cheddar', category: 'Adicional', price: 8.00, isAvailable: true },
  { id: '6', name: 'Pizza de Frango com Catupiry', category: 'Pizza', sizes: { medio: 49.90, grande: 59.90 }, isAvailable: true, description: 'Molho de tomate, mussarela, frango desfiado e catupiry.' },
  { id: '7', name: 'Guaraná Antarctica', category: 'Bebida', price: 12.00, volume: '2L', isAvailable: true },
  { id: '8', name: 'Fanta Laranja', category: 'Bebida', price: 12.00, volume: '2L', isAvailable: false },
  { id: '9', name: 'Coca-Cola', category: 'Bebida', price: 6.00, volume: 'Lata 350ml', isAvailable: true },
  { id: '10', name: 'Guaraná', category: 'Bebida', price: 6.00, volume: 'Lata 350ml', isAvailable: true },
  { id: '11', name: 'Água Mineral', category: 'Bebida', price: 4.00, volume: '500ml', isAvailable: true },
];

export const mockOrders: Order[] = [
  { id: '1001', customerName: 'João Silva', items: [{ productName: 'Pizza de Calabresa', quantity: 2, size: 'medio' }], total: 91.00, status: 'Recebido', timestamp: '10:30', orderType: 'retirada', notes: 'Uma sem azeitona, por favor.' },
  { id: '1002', customerName: 'Maria Oliveira', items: [{ productName: 'Pizza de Quatro Queijos', quantity: 1, size: 'grande' }], total: 62.00, status: 'Preparando', timestamp: '10:32', orderType: 'retirada' },
  { id: '1003', customerName: 'Carlos Pereira', customerPhone: '(48) 99999-8888', items: [{ productName: 'Pizza Portuguesa', quantity: 1, size: 'medio' }], total: 55.90, status: 'Pronto', timestamp: '10:35', orderType: 'entrega', address: 'Rua das Gaivotas, 789, Apto 3, Bairro Sol, Florianópolis - SC' },
  { id: '1004', customerName: 'Ana Costa', customerPhone: '(21) 98765-4321', items: [{ productName: 'Pizza de Frango com Catupiry', quantity: 1, size: 'grande' }], total: 59.90, status: 'Em Entrega', timestamp: '10:40', orderType: 'entrega', locationLink: 'https://maps.app.goo.gl/examplelink1', notes: 'Deixar na portaria com o Sr. Valdir.' },
  { id: '1005', customerName: 'Lucas Souza', items: [{ productName: 'Coca-Cola 2L', quantity: 1 }], total: 12.00, status: 'Entregue', timestamp: '10:25', orderType: 'retirada' },
  { id: '1006', customerName: 'Mariana Lima', customerPhone: '(11) 91234-5678', items: [{ productName: 'Pizza de Calabresa', quantity: 1, size: 'pequeno' }, { productName: 'Coca-Cola 2L', quantity: 1 }], total: 47.5, status: 'Preparando', timestamp: '10:42', orderType: 'entrega', address: 'Avenida Beira Mar, 456, Centro, Rio de Janeiro - RJ' },
  { id: '1007', customerName: 'Pedro Almeida', items: [{ productName: 'Pizza de Quatro Queijos', quantity: 1, size: 'GG' }], total: 72.00, status: 'Cancelado', timestamp: '10:50', orderType: 'retirada' },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: 'João Silva', phone: '(11) 98765-4321', lastOrderDate: '2024-07-20', totalSpent: 91.00, orderCount: 1 },
  { id: '2', name: 'Maria Oliveira', phone: '(21) 91234-5678', lastOrderDate: '2024-07-20', totalSpent: 62.00, orderCount: 1 },
  { id: '3', name: 'Carlos Pereira', phone: '(31) 95555-4444', lastOrderDate: '2024-07-19', totalSpent: 110.50, orderCount: 3 },
  { id: '4', name: 'Ana Costa', phone: '(41) 98888-7777', lastOrderDate: '2024-07-18', totalSpent: 230.00, orderCount: 5 },
];

export const orderStatuses: OrderStatus[] = ["Recebido", "Preparando", "Pronto", "Em Entrega", "Entregue", "Cancelado"];
