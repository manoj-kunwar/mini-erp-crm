export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  business_name: string;
  gst_number?: string | null;
  customer_type: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  follow_up_date?: string | null;
  notes?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerFollowup {
  id: number;
  customer_id: number;
  note: string;
  follow_up_date?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  location: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  quantity_changed: number;
  movement_type: StockMovementType;
  reason: string;
  created_by?: number | null;
  created_by_name?: string | null;
  timestamp?: string;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItemSnapshot {
  id?: number;
  challan_id?: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  customer_business_name?: string;
  total_quantity: number;
  total_amount: number;
  status: ChallanStatus;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: ChallanItemSnapshot[];
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
