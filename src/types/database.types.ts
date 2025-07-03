export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          lastOrderDate: string
          locationLink: string | null
          name: string
          orderCount: number
          phone: string
          totalSpent: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          lastOrderDate: string
          locationLink?: string | null
          name: string
          orderCount: number
          phone: string
          totalSpent: number
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          lastOrderDate?: string
          locationLink?: string | null
          name?: string
          orderCount?: number
          phone?: string
          totalSpent?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          isRead: boolean
          link: string | null
          targetRoles: Json
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          isRead?: boolean
          link?: string | null
          targetRoles: Json
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          isRead?: boolean
          link?: string | null
          targetRoles?: Json
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          customerName: string
          customerPhone: string | null
          id: number
          items: Json
          locationLink: string | null
          notes: string | null
          orderType: string
          status: string
          timestamp: string
          total: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          customerName: string
          customerPhone?: string | null
          id?: number
          items: Json
          locationLink?: string | null
          notes?: string | null
          orderType: string
          status: string
          timestamp: string
          total: number
        }
        Update: {
          address?: string | null
          created_at?: string
          customerName?: string
          customerPhone?: string | null
          id?: number
          items?: Json
          locationLink?: string | null
          notes?: string | null
          orderType?: string
          status?: string
          timestamp?: string
          total?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          isAvailable: boolean
          name: string
          price: number | null
          sizes: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          isAvailable?: boolean
          name: string
          price?: number | null
          sizes?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          isAvailable?: boolean
          name?: string
          price?: number | null
          sizes?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          email: string | null
          fallback: string | null
          id: string
          name: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          email?: string | null
          fallback?: string | null
          id: string
          name?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          email?: string | null
          fallback?: string | null
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          basePrices: Json | null
          id: number
          sizeAvailability: Json | null
        }
        Insert: {
          basePrices?: Json | null
          id: number
          sizeAvailability?: Json | null
        }
        Update: {
          basePrices?: Json | null
          id?: number
          sizeAvailability?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
