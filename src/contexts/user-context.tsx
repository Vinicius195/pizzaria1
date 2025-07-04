
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type {
  UserProfile,
  Order,
  Product,
  Customer,
  Notification,
  PizzaSettings,
  UserRole,
  UserStatus,
} from '@/types';
import type { AddOrderFormValues } from '@/components/app/add-order-dialog';
import type { ProductFormValues } from '@/components/app/add-product-dialog';
import { TablesInsert, TablesUpdate } from '@/types/database.types';
import { format } from 'date-fns';

interface UserContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  orders: Order[];
  products: Product[];
  customers: Customer[];
  notifications: Notification[];
  settings: PizzaSettings | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  registerUser: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<{ success: boolean; message: string }>;
  updateUser: (userId: string, data: Partial<UserProfile>, password?: string | null) => Promise<{ success: boolean; message: string }>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addOrder: (data: AddOrderFormValues) => Promise<void>;
  updateOrder: (orderId: number, data: AddOrderFormValues) => Promise<void>;
  advanceOrderStatus: (orderId: number) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  deleteAllOrders: () => Promise<void>;
  addProduct: (data: ProductFormValues) => Promise<void>;
  updateProduct: (productId: string, data: ProductFormValues) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductAvailability: (productId: string, isAvailable: boolean) => Promise<void>;
  addOrUpdateCustomer: (data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  updateSettings: (data: PizzaSettings) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  if (!supabase) {
    const errorMsg = "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.";
    const dummyContext: UserContextType = {
        currentUser: null,
        users: [],
        orders: [],
        products: [],
        customers: [],
        notifications: [],
        settings: null,
        isLoading: false,
        login: async () => ({ success: false, message: errorMsg }),
        logout: async () => {},
        registerUser: async () => ({ success: false, message: errorMsg }),
        updateUser: async () => ({ success: false, message: errorMsg }),
        updateUserStatus: async () => {},
        deleteUser: async () => {},
        addOrder: async () => {},
        updateOrder: async () => {},
        advanceOrderStatus: async () => {},
        cancelOrder: async () => {},
        deleteAllOrders: async () => {},
        addProduct: async () => {},
        updateProduct: async () => {},
        deleteProduct: async () => {},
        toggleProductAvailability: async () => {},
        addOrUpdateCustomer: async () => {},
        deleteCustomer: async () => {},
        updateSettings: async () => {},
        markNotificationAsRead: async () => {},
        markAllNotificationsAsRead: async () => {},
    };
    return <UserContext.Provider value={dummyContext}>{children}</UserContext.Provider>;
  }

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<PizzaSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to create notifications
  const createNotification = async (notification: Omit<TablesInsert<'notifications'>, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('notifications').insert(notification);
    if (error) console.error('Error creating notification:', error);
  };

  const fetchAllData = useCallback(async (user: SupabaseUser) => {
    setIsLoading(true);
    try {
      const [
        profileRes,
        usersRes,
        ordersRes,
        productsRes,
        customersRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profiles').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('category').order('name'),
        supabase.from('customers').select('*').order('name'),
        supabase.from('settings').select('*').eq('id', 1).single(),
      ]);

      if (profileRes.error || !profileRes.data) throw profileRes.error || new Error("User profile not found.");
      if (profileRes.data.status !== 'Aprovado') {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      const currentProfile = profileRes.data as UserProfile;
      setCurrentUser(currentProfile);
      setUsers(usersRes.data as UserProfile[] || []);
      setOrders(ordersRes.data as Order[] || []);
      setProducts(productsRes.data as Product[] || []);
      setCustomers(customersRes.data as Customer[] || []);
      setSettings(settingsRes.data as PizzaSettings || null);

      // Fetch notifications separately as they depend on the user's role
      const notificationsRes = await supabase
        .from('notifications')
        .select('*')
        .contains('targetRoles', [currentProfile.role]);

      setNotifications(notificationsRes.data as Notification[] || []);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      await supabase.auth.signOut();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Check if user is already being loaded to avoid multiple fetches
        if (!isLoading) {
            await fetchAllData(session.user);
        }
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
    
    // Check for existing session on initial load
    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchAllData(session.user);
      } else {
        setIsLoading(false);
      }
    }
    getInitialSession();

    return () => authListener.subscription.unsubscribe();
  }, [fetchAllData, isLoading]);

  useEffect(() => {
    if (!currentUser) return;

    // Real-time subscriptions
    const ordersChannel = supabase.channel('orders-channel')
      .on<Order>('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') setOrders(prev => [payload.new, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        if (payload.eventType === 'UPDATE') setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
        if (payload.eventType === 'DELETE') setOrders(prev => prev.filter(o => o.id !== (payload.old as any).id));
      }).subscribe();
      
    const productsChannel = supabase.channel('products-channel')
      .on<Product>('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
        if (payload.eventType === 'INSERT') setProducts(prev => [...prev, payload.new].sort((a,b) => a.name.localeCompare(b.name)));
        if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== (payload.old as any).id));
      }).subscribe();

    const customersChannel = supabase.channel('customers-channel')
        .on<Customer>('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, payload => {
            if (payload.eventType === 'INSERT') setCustomers(prev => [...prev, payload.new].sort((a,b) => a.name.localeCompare(b.name)));
            if (payload.eventType === 'UPDATE') setCustomers(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
            if (payload.eventType === 'DELETE') setCustomers(prev => prev.filter(c => c.id !== (payload.old as any).id));
        }).subscribe();

    const profilesChannel = supabase.channel('profiles-channel')
        .on<UserProfile>('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
            if (payload.eventType === 'INSERT') setUsers(prev => [...prev, payload.new]);
            if (payload.eventType === 'UPDATE') {
                setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u));
                if (currentUser && payload.new.id === currentUser.id) setCurrentUser(payload.new);
            }
            if (payload.eventType === 'DELETE') setUsers(prev => prev.filter(u => u.id !== (payload.old as any).id));
        }).subscribe();
    
    const notificationsChannel = supabase.channel('notifications-channel')
      .on<Notification>('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNotification = payload.new;
          // Check if current user should receive it
          if (currentUser && newNotification.targetRoles && (newNotification.targetRoles as unknown as string[]).includes(currentUser.role as string)) {
            setNotifications(prev => [newNotification, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          }
        }
        if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
        }
      }).subscribe();
      
    const settingsChannel = supabase.channel('settings-channel')
      .on<PizzaSettings>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, payload => {
        setSettings(payload.new);
      }).subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [currentUser]);

  // --- Auth Functions ---
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            return { success: false, message: 'Email ou senha inválidos. Por favor, verifique seus dados.' };
        }
        return { success: false, message: 'Ocorreu um erro ao tentar fazer login. Tente novamente.' };
    }
    
    if (data.user) {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('status').eq('id', data.user.id).single();
      if (profileError || !profile) return { success: false, message: 'Perfil de usuário não encontrado.' };
      if (profile.status === 'Pendente') return { success: false, message: 'Sua conta ainda está pendente de aprovação.' };
      if (profile.status === 'Reprovado') return { success: false, message: 'Sua conta foi reprovada.' };
    }
    
    return { success: true, message: 'Login bem-sucedido!' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const registerUser = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
        },
      },
    });

    if (error) {
      console.error('Supabase registration error:', error.message);
      if (error.message.includes('User already registered')) {
        return { success: false, message: 'Este endereço de e-mail já está cadastrado. Por favor, tente fazer login.' };
      }
      if (error.message.includes('valid email') || error.message.includes('validation failed')) {
        return { success: false, message: 'O endereço de e-mail fornecido não parece ser válido.' };
      }
      return { success: false, message: 'Ocorreu um erro inesperado durante o cadastro. Por favor, tente novamente.' };
    }

    if (!authData.user) return { success: false, message: 'Não foi possível criar o usuário. Tente novamente.' };

    // The notification is now created by a database trigger, so this is no longer needed.

    return { success: true, message: 'Cadastro realizado! Sua conta precisa ser aprovada por um administrador.' };
  };

  const updateUser = async (userId: string, profileData: Partial<UserProfile>, newPassword?: string | null) => {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        email: profileData.email,
        password: newPassword || undefined,
    });

    if (error) return { success: false, message: `Erro ao atualizar autenticação: ${error.message}` };
    
    const { error: profileError } = await supabase.from('profiles').update({ 
        name: profileData.name, 
        email: profileData.email, 
        role: profileData.role 
    }).eq('id', userId);

    if (profileError) return { success: false, message: `Erro ao atualizar perfil: ${profileError.message}` };

    return { success: true, message: 'Usuário atualizado com sucesso!' };
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    await supabase.from('profiles').update({ status }).eq('id', userId);
  };

  const deleteUser = async (userId: string) => {
    await supabase.auth.admin.deleteUser(userId);
  };

  // --- Helper Functions ---
  const calculateOrderTotal = (items: AddOrderFormValues['items']): number => {
    return items.reduce((total, item) => {
      let itemPrice = 0;
      if (item.isHalfHalf) {
          const product1 = products.find(p => p.id === item.productId);
          const product2 = products.find(p => p.id === item.product2Id);
          if (product1 && product2 && item.size && product1.sizes && product2.sizes) {
              const price1 = (product1.sizes as Record<string, number>)[item.size] || 0;
              const price2 = (product2.sizes as Record<string, number>)[item.size] || 0;
              itemPrice = Math.max(price1, price2);
          }
      } else {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              if (item.size && product.sizes) {
                  itemPrice = (product.sizes as Record<string, number>)[item.size] || 0;
              } else if (product.price) {
                  itemPrice = product.price;
              }
          }
      }
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const formatOrderItems = (items: AddOrderFormValues['items']) => {
    return items.map(item => {
        let productName = '';
        if (item.isHalfHalf) {
            const name1 = products.find(p => p.id === item.productId)?.name || 'Sabor 1';
            const name2 = products.find(p => p.id === item.product2Id)?.name || 'Sabor 2';
            productName = `Meio a Meio: ${name1} / ${name2}`;
        } else {
            productName = products.find(p => p.id === item.productId)?.name || 'Produto desconhecido';
        }
        return {
            productName: productName,
            quantity: item.quantity,
            size: item.size
        };
    });
  };

  // --- Order Functions ---
  const addOrder = async (data: AddOrderFormValues) => {
    const total = calculateOrderTotal(data.items);
    const formattedItems = formatOrderItems(data.items);
    
    const newOrder: TablesInsert<'orders'> = {
      customerName: data.customerName,
      customerPhone: data.customerPhone || null,
      orderType: data.orderType,
      items: formattedItems as any,
      address: data.address || null,
      locationLink: data.locationLink || null,
      notes: data.notes || null,
      total,
      status: 'Recebido',
      timestamp: format(new Date(), 'HH:mm'),
    };
    
    const { data: insertedOrder, error } = await supabase.from('orders').insert(newOrder).select().single();
    
    if (!error && insertedOrder) {
      // After successfully adding order, update or create customer
      const { data: existingCustomer } = await supabase.from('customers').select('*').eq('name', data.customerName).single();

      if (existingCustomer) {
        const { error: updateError } = await supabase.from('customers').update({
            orderCount: (existingCustomer.orderCount || 0) + 1,
            totalSpent: (existingCustomer.totalSpent || 0) + total,
            lastOrderDate: new Date().toISOString().split('T')[0],
            phone: data.customerPhone || existingCustomer.phone, // Update phone if provided
        }).eq('id', existingCustomer.id);
        if (updateError) console.error("Error updating customer stats:", updateError);
      } else {
        const { error: insertError } = await supabase.from('customers').insert({
            name: data.customerName,
            phone: data.customerPhone || null,
            address: data.address || null,
            locationLink: data.locationLink || null,
            orderCount: 1,
            totalSpent: total,
            lastOrderDate: new Date().toISOString().split('T')[0],
        });
        if (insertError) console.error("Error creating new customer from order:", insertError);
      }
      
      await createNotification({
        title: 'Novo Pedido!',
        description: `Pedido #${insertedOrder.id} de ${data.customerName} no valor de R$ ${total.toFixed(2)} foi recebido.`,
        targetRoles: ['Administrador', 'Funcionário'],
        link: '/pedidos'
      });
    } else {
      console.error("Error adding order:", error);
    }
  };

  const updateOrder = async (orderId: number, data: AddOrderFormValues) => {
    const total = calculateOrderTotal(data.items);
    const formattedItems = formatOrderItems(data.items);

    const updatedOrder: TablesUpdate<'orders'> = {
      ...data,
      total,
      items: formattedItems as any,
    };

    const { error } = await supabase.from('orders').update(updatedOrder).eq('id', orderId);
    if (error) console.error("Error updating order:", error);
    else {
      if (!currentUser) return;
      await createNotification({
        title: 'Pedido Modificado',
        description: `O pedido #${orderId} foi alterado por ${currentUser.name}.`,
        targetRoles: ['Administrador', 'Funcionário'],
        link: `/pedidos`
      });
    }
  };

  const advanceOrderStatus = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const statusFlow: OrderStatus[] = ["Recebido", "Preparando", "Pronto", "Em Entrega", "Entregue"];
    const currentIndex = statusFlow.indexOf(order.status as OrderStatus);
    if (currentIndex < statusFlow.length - 1) {
      const newStatus = statusFlow[currentIndex + 1];
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) console.error("Error advancing order status:", error);
    }
  };

  const cancelOrder = async (orderId: number) => {
    const { error } = await supabase.from('orders').update({ status: 'Cancelado' }).eq('id', orderId);
    if (error) console.error("Error canceling order:", error);
  };
  
  const deleteAllOrders = async () => {
    if (!currentUser || currentUser.role !== 'Administrador') return;
    const { error } = await supabase.from('orders').delete().neq('id', 0); // trick to delete all rows
    if (error) console.error("Error deleting all orders:", error);
    else {
        await createNotification({
            title: 'Histórico de Pedidos Apagado',
            description: `${currentUser.name} limpou todos os pedidos do sistema.`,
            targetRoles: ['Administrador'],
        });
    }
  };

  // --- Product Functions ---
  const addProduct = async (data: ProductFormValues) => {
    let insertData: TablesInsert<'products'> = {
        name: data.name,
        category: data.category!,
        description: data.description || null,
        price: null,
        sizes: null,
    };

    if (data.category === 'Pizza' && data.pizzaSizes) {
        insertData.sizes = data.pizzaSizes as any;
    } else if (data.category === 'Bebida' && data.drinkSizes) {
        insertData.sizes = data.drinkSizes.reduce((acc, size) => {
            acc[size.name] = size.price;
            return acc;
        }, {} as Record<string, number>);
    } else if (data.category === 'Adicional' && data.price) {
        insertData.price = data.price;
    }

    const { error } = await supabase.from('products').insert(insertData);
    if (error) console.error("Error adding product:", error);
  };
  
  const updateProduct = async (productId: string, data: ProductFormValues) => {
    let updateData: TablesUpdate<'products'> = {
        name: data.name,
        category: data.category!,
        description: data.description || null,
        price: null,
        sizes: null,
    };
    if (data.category === 'Pizza' && data.pizzaSizes) {
        updateData.sizes = data.pizzaSizes as any;
    } else if (data.category === 'Bebida' && data.drinkSizes) {
        updateData.sizes = data.drinkSizes.reduce((acc, size) => {
            acc[size.name] = size.price;
            return acc;
        }, {} as Record<string, number>);
    } else if (data.category === 'Adicional' && data.price) {
        updateData.price = data.price;
    }
    const { error } = await supabase.from('products').update(updateData).eq('id', productId);
    if (error) console.error("Error updating product:", error);
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) console.error("Error deleting product:", error);
  };

  const toggleProductAvailability = async (productId: string, isAvailable: boolean) => {
    const { error } = await supabase.from('products').update({ isAvailable }).eq('id', productId);
    if (error) console.error("Error toggling product availability:", error);
  };

  // --- Customer Functions ---
  const addOrUpdateCustomer = async (data: Partial<Customer>) => {
    if (data.id) { // Update existing customer
        const { error } = await supabase.from('customers').update({
            name: data.name,
            phone: data.phone ?? null,
            address: data.address ?? null,
            locationLink: data.locationLink ?? null,
        }).eq('id', data.id);
        if (error) console.error("Error updating customer:", error);
    } else { // Add new customer, created via the customer page
        const { error } = await supabase.from('customers').insert({
            name: data.name!,
            phone: data.phone ?? null,
            address: data.address ?? null,
            locationLink: data.locationLink ?? null,
        });
        if (error) console.error("Error adding customer:", error);
    }
  };
  
  const deleteCustomer = async (customerId: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) console.error("Error deleting customer:", error);
  };

  // --- Settings Functions ---
  const updateSettings = async (data: PizzaSettings) => {
    const { error } = await supabase.from('settings').update({ basePrices: data.basePrices, sizeAvailability: data.sizeAvailability }).eq('id', 1);
    if (error) console.error("Error updating settings:", error);
  };

  // --- Notification Functions ---
  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase.from('notifications').update({ isRead: true }).eq('id', notificationId);
    if (error) console.error("Error marking notification as read:", error);
  };
  
  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    const { error } = await supabase.from('notifications').update({ isRead: true }).contains('targetRoles', [currentUser.role]);
    if (error) console.error("Error marking all notifications as read:", error);
  };

  const value: UserContextType = {
    currentUser,
    users,
    orders,
    products,
    customers,
    notifications,
    settings,
    isLoading,
    login,
    logout,
    registerUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    addOrder,
    updateOrder,
    advanceOrderStatus,
    cancelOrder,
    deleteAllOrders,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    addOrUpdateCustomer,
    deleteCustomer,
    updateSettings,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

    
    
