// Railway redeploy trigger
export type Role = 'user' | 'admin' | 'staff';
export type PetStatus = 'available' | 'adopted' | 'pending_approval' | 'rejected';
export type AdoptionStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'paid' | 'shipped';

export interface User {
  id: number;
  email: string;
  role: Role;
  name: string;
  address?: string;
  phone?: string;
}

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  description: string;
  image_url: string;
  status: PetStatus;
  submitted_by: number;
}

export interface Adoption {
  id: number;
  pet_id: number;
  user_id: number;
  status: AdoptionStatus;
  application_text: string;
  created_at: string;
  pet_name?: string;
  pet_image?: string;
  user_name?: string;
  user_email?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  name?: string;
  price?: number;
  image_url?: string;
  stock?: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: OrderStatus;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  created_at: string;
  user_name?: string;
}

export interface MedicalRecord {
  id: number;
  pet_id: number;
  vaccination_date: string;
  next_due_date: string;
  notes: string;
  staff_id: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at: string;
}
