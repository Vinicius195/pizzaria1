'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UserProfile, UserRole, UserStatus, Customer, Notification, Order, OrderStatus } from '@/types';
import { mockCustomers, mockProducts, mockOrders, orderStatuses } from '@/lib/mock-data';
import type { AddOrderFormValues } from '@/components/app/add-order-dialog';
import { useToast } from '@/hooks/use-toast';

// Mock initial data. In a real app, this might be an empty array.
const initialUserProfiles: UserProfile[] = [
  { key: 'admin', name: 'Sérgio Lemos', email: 'sergio.lemos@belamassa.com', password: 'admin', role: 'Administrador', status: 'Aprovado', avatar: 'https://placehold.co/40x40.png', fallback: 'SL' },
  { key: 'employee1', name: 'Beatriz Costa', email: 'beatriz.costa@belamassa.com', password: 'func', role: 'Funcionário', status: 'Aprovado', avatar: 'https://placehold.co/40x40.png', fallback: 'BC' },
];


export type LoginResult = {
  success: boolean;
  message: string;
};

export type RegisterResult = {
    success: boolean;
    message: string;
};

// Data for adding/updating a customer.
// If 'id' is present, it's an update.
// If 'orderTotal' is present, it's an update from a new order.
export type CustomerData = Partial<Omit<Customer, 'id'>> & {
  id?: string;
  orderTotal?: number;
  name: string;
  phone: string;
};


interface UserContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  customers: Customer[];
  orders: Order[];
  login: (email: string, pass: string) => LoginResult;
  logout: () => void;
  registerUser: (details: Omit<UserProfile, 'key' | 'status' | 'avatar' | 'fallback'>) => RegisterResult;
  updateUserStatus: (key: string, status: UserStatus) => void;
  updateUser: (key: string, data: Partial<UserProfile>) => RegisterResult;
  deleteUser: (key: string) => void;
  addOrUpdateCustomer: (data: CustomerData) => void;
  isLoading: boolean;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  advanceOrderStatus: (orderId: string) => void;
  addOrder: (data: AddOrderFormValues) => void;
  cancelOrder: (orderId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'pizzafast-users';
const CUSTOMERS_STORAGE_KEY = 'pizzafast-customers';
const NOTIFICATIONS_STORAGE_KEY = 'pizzafast-notifications';
const ORDERS_STORAGE_KEY = 'pizzafast-orders';
const CURRENT_USER_STORAGE_KEY = 'currentUserKey';

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            setUsers(initialUserProfiles);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUserProfiles));
        }
        
        const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
        if (storedCustomers) {
            setCustomers(JSON.parse(storedCustomers));
        } else {
            setCustomers(mockCustomers);
            localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(mockCustomers));
        }

        const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications));
        }

        const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (storedOrders) {
            setOrders(JSON.parse(storedOrders));
        } else {
            const sortedMockOrders = mockOrders.slice().sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
            setOrders(sortedMockOrders);
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(sortedMockOrders));
        }

        const storedUserKey = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (storedUserKey) {
            setCurrentUserKey(storedUserKey);
        }
    } catch (error) {
        console.error("Could not access localStorage.", error);
        setUsers(initialUserProfiles); // fallback
        setCustomers(mockCustomers);
        setOrders(mockOrders);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Could not save users to localStorage.", error);
    }
  };
  
  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCustomers));
    } catch (error) {
      console.error("Could not save customers to localStorage.", error);
    }
  };

  const saveNotifications = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error("Could not save notifications to localStorage.", error);
    }
  };
  
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    } catch (error) {
      console.error("Could not save orders to localStorage.", error);
    }
  };

  const currentUser = currentUserKey ? users.find(u => u.key === currentUserKey) ?? null : null;

  const login = (email: string, pass: string): LoginResult => {
    const user = users.find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.password === pass
    );

    if (!user) {
      return { success: false, message: "Usuário ou senha inválidos. Tente novamente." };
    }

    if (user.status === 'Pendente') {
        return { success: false, message: "Sua conta está pendente de aprovação." };
    }
    
    if (user.status === 'Reprovado') {
        return { success: false, message: "Sua conta foi reprovada. Entre em contato com o administrador." };
    }

    if (user.status === 'Aprovado') {
      setCurrentUserKey(user.key);
      try {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.key);
      } catch (error) {
        console.error("Could not access localStorage.", error);
      }
      return { success: true, message: "Login bem-sucedido!" };
    }

    return { success: false, message: "Ocorreu um erro desconhecido." };
  };
  
  const logout = () => {
    setCurrentUserKey(null);
    try {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch (error) {
        console.error("Could not access localStorage.", error);
    }
  };

  const registerUser = (details: Omit<UserProfile, 'key' | 'status' | 'avatar' | 'fallback'>): RegisterResult => {
      if (users.some(u => u.email.toLowerCase() === details.email.toLowerCase())) {
          return { success: false, message: 'Este e-mail já está cadastrado.' };
      }

      const adminExists = users.some(u => u.role === 'Administrador' && u.status === 'Aprovado');
      let newUserStatus: UserStatus = 'Pendente';
      let message = 'Cadastro realizado! Sua conta precisa ser aprovada por um administrador.';

      if (!adminExists && details.role === 'Administrador') {
          newUserStatus = 'Aprovado';
          message = 'Primeiro administrador cadastrado com sucesso! Você já pode fazer login.';
      }

      const fallback = details.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const newUser: UserProfile = {
          ...details,
          key: `user-${Date.now()}`,
          status: newUserStatus,
          avatar: 'https://placehold.co/40x40.png',
          fallback,
      };

      saveUsers([...users, newUser]);
      return { success: true, message };
  };

  const updateUserStatus = (key: string, status: UserStatus) => {
    const updatedUsers = users.map(user =>
      user.key === key ? { ...user, status } : user
    );
    saveUsers(updatedUsers);
  };

  const updateUser = (key: string, data: Partial<UserProfile>): RegisterResult => {
    const userToUpdate = users.find(u => u.key === key);
    if (!userToUpdate) {
        return { success: false, message: 'Usuário não encontrado.' };
    }

    if (data.email && users.some(u => u.email.toLowerCase() === data.email?.toLowerCase() && u.key !== key)) {
        return { success: false, message: 'Este e-mail já pertence a outra conta.' };
    }
    
    const updatedUsers = users.map(user => {
        if (user.key === key) {
            const updatedUser = { ...user, ...data };
            if (data.name) {
                updatedUser.fallback = data.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            }
            if (!data.password || data.password.trim() === '') {
              updatedUser.password = user.password;
            }
            return updatedUser;
        }
        return user;
    });

    saveUsers(updatedUsers);
    return { success: true, message: 'Usuário atualizado com sucesso!' };
  };
  
  const deleteUser = (key: string) => {
    const updatedUsers = users.filter(user => user.key !== key);
    saveUsers(updatedUsers);
  };

  const addOrUpdateCustomer = (data: CustomerData) => {
    setCustomers(prevCustomers => {
        // Try to find by ID (for edits) or by phone/name (for updates from orders)
        const existingCustomerIndex = prevCustomers.findIndex(c => 
            (data.id && c.id === data.id) || 
            (data.phone && c.phone === data.phone && c.phone !== '') || 
            (c.name.toLowerCase() === data.name.toLowerCase())
        );

        if (existingCustomerIndex > -1) {
            // Update existing customer
            const updatedCustomers = [...prevCustomers];
            const existing = updatedCustomers[existingCustomerIndex];
            updatedCustomers[existingCustomerIndex] = {
                ...existing,
                ...data,
                totalSpent: existing.totalSpent + (data.orderTotal || 0),
                orderCount: existing.orderCount + (data.orderTotal ? 1 : 0),
                lastOrderDate: data.orderTotal ? new Date().toISOString().split('T')[0] : existing.lastOrderDate,
            };
            saveCustomers(updatedCustomers);
            return updatedCustomers;
        } else {
            // Add new customer
            const newCustomer: Customer = {
                id: String(Date.now()),
                name: data.name,
                phone: data.phone,
                address: data.address,
                locationLink: data.locationLink,
                lastOrderDate: new Date().toISOString().split('T')[0],
                totalSpent: data.orderTotal || 0,
                orderCount: data.orderTotal ? 1 : 0,
            };
            const newCustomers = [...prevCustomers, newCustomer];
            saveCustomers(newCustomers);
            return newCustomers;
        }
    });
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => {
      const updatedNotifications = [newNotification, ...prev].slice(0, 50); // Keep last 50
      saveNotifications(updatedNotifications);
      return updatedNotifications;
    });
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
    saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    const updated = notifications.map(n =>
      n.targetRoles.includes(currentUser.role) ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
  };

  const advanceOrderStatus = (orderId: string) => {
    const originalOrder = orders.find(o => o.id === orderId);
    if (!originalOrder) return;
    
    let nextStatus: OrderStatus | undefined;
    
    const currentStatusIndex = orderStatuses.indexOf(originalOrder.status);
    const isActionable = originalOrder.status !== 'Entregue' && originalOrder.status !== 'Cancelado' && currentStatusIndex !== -1;

    if (!isActionable) return;

    if (originalOrder.status === 'Pronto') {
        nextStatus = originalOrder.orderType === 'retirada' ? 'Entregue' : 'Em Entrega';
    } else {
        const nextStatusIndex = currentStatusIndex + 1;
        if (nextStatusIndex < orderStatuses.length) {
            const potentialNextStatus = orderStatuses[nextStatusIndex];
            if (potentialNextStatus !== 'Cancelado') {
                nextStatus = potentialNextStatus;
            }
        }
    }

    if (!nextStatus) return;

    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: nextStatus! } : o);
    saveOrders(updatedOrders);

    toast({
        title: "Status do Pedido Atualizado!",
        description: `O pedido #${orderId} agora está: ${nextStatus}.`,
    });

    let notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'> | null = null;
    switch (nextStatus) {
        case 'Preparando':
            notificationData = {
                title: `Pedido #${orderId} em Preparo`,
                description: `O pedido de ${originalOrder.customerName} começou a ser preparado.`,
                targetRoles: ['Administrador', 'Funcionário'],
                link: '/pedidos'
            };
            break;
        case 'Pronto':
          notificationData = originalOrder.orderType === 'entrega' ? {
              title: 'Pedido Pronto para Entrega!',
              description: `O pedido #${orderId} de ${originalOrder.customerName} está pronto e aguardando o entregador.`,
              targetRoles: ['Funcionário'],
              link: '/entregas'
          } : {
              title: 'Pedido Pronto para Retirada!',
              description: `O pedido #${orderId} de ${originalOrder.customerName} está pronto para ser retirado pelo cliente.`,
              targetRoles: ['Funcionário'],
              link: '/pedidos'
          };
          break;
        case 'Em Entrega':
            notificationData = {
                title: `Pedido #${orderId} em Rota`,
                description: `O pedido de ${originalOrder.customerName} saiu para entrega.`,
                targetRoles: ['Administrador'],
                link: '/entregas'
            };
            break;
        case 'Entregue':
          notificationData = {
            title: 'Pedido Entregue',
            description: `O pedido #${orderId} de ${originalOrder.customerName} foi entregue.`,
            targetRoles: ['Administrador'],
            link: originalOrder.orderType === 'entrega' ? '/entregas' : '/pedidos'
          };
          break;
    }

    if (notificationData) {
      addNotification(notificationData);
    }
  };
  
  const addOrder = (data: AddOrderFormValues) => {
    const orderItemsWithDetails = data.items.map(item => {
        const product1 = mockProducts.find(p => p.id === item.productId);
        if (!product1) return null;

        if (item.isHalfHalf && item.size) {
            const product2 = mockProducts.find(p => p.id === item.product2Id);
            if (!product2) return null;

            const price1 = product1.sizes?.[item.size] ?? 0;
            const price2 = product2.sizes?.[item.size] ?? 0;
            const finalPrice = Math.max(price1, price2);

            return {
                productName: `Meio a Meio: ${product1.name} / ${product2.name}`,
                quantity: item.quantity,
                size: item.size,
                price: finalPrice,
            };
        }
        
        const price = (product1.sizes && item.size) 
            ? product1.sizes[item.size] || 0
            : product1.price || 0;

        return {
            productName: product1.name,
            quantity: item.quantity,
            size: item.size,
            price: price,
        };
    }).filter((item): item is NonNullable<typeof item> => item !== null);


    const total = orderItemsWithDetails.reduce((acc, item) => acc + (item!.price * item!.quantity), 0);
    const newOrderId = String(Math.max(0, ...orders.map(o => parseInt(o.id, 10))) + 1);

    const newOrder: Order = {
        id: newOrderId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        items: orderItemsWithDetails.map(({ productName, quantity, size }) => ({ productName, quantity, size })),
        total,
        status: 'Recebido',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        orderType: data.orderType,
        address: data.address,
        locationLink: data.locationLink,
        notes: data.notes,
    };

    saveOrders([newOrder, ...orders]);
    
    toast({
      title: "Pedido Criado com Sucesso!",
      description: `O pedido para ${data.customerName} foi adicionado.`,
    });

    addOrUpdateCustomer({
        name: newOrder.customerName,
        phone: newOrder.customerPhone || '',
        address: newOrder.address,
        locationLink: newOrder.locationLink,
        orderTotal: newOrder.total,
    });
    
    addNotification({
        title: `Novo Pedido #${newOrderId}`,
        description: `Cliente: ${newOrder.customerName}, Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        targetRoles: ['Administrador'],
        link: '/pedidos'
    });
  };
  
  const cancelOrder = (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel || orderToCancel.status === 'Cancelado' || orderToCancel.status === 'Entregue') return;
    
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: 'Cancelado' } : o);
    saveOrders(updatedOrders);

    toast({
        variant: "destructive",
        title: "Pedido Cancelado!",
        description: `O pedido #${orderId} foi cancelado.`,
    });

    addNotification({
        title: 'Pedido Cancelado',
        description: `O pedido #${orderId} de ${orderToCancel.customerName} foi cancelado.`,
        targetRoles: ['Administrador', 'Funcionário'],
        link: '/pedidos'
    });
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      users, 
      customers, 
      orders,
      login, 
      logout, 
      isLoading, 
      registerUser, 
      updateUserStatus, 
      updateUser, 
      deleteUser, 
      addOrUpdateCustomer,
      notifications,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      advanceOrderStatus,
      addOrder,
      cancelOrder,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
