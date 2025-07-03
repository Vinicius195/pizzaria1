'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UserProfile, UserRole, UserStatus, Customer, Notification } from '@/types';
import { mockCustomers, mockProducts, mockOrders } from '@/lib/mock-data';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'pizzafast-users';
const CUSTOMERS_STORAGE_KEY = 'pizzafast-customers';
const NOTIFICATIONS_STORAGE_KEY = 'pizzafast-notifications';
const CURRENT_USER_STORAGE_KEY = 'currentUserKey';

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

        const storedUserKey = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (storedUserKey) {
            setCurrentUserKey(storedUserKey);
        }
    } catch (error) {
        console.error("Could not access localStorage.", error);
        setUsers(initialUserProfiles); // fallback
        setCustomers(mockCustomers);
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

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      users, 
      customers, 
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
