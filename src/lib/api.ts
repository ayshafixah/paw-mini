// Railway redeploy trigger
import { User, Pet, Adoption, Product, CartItem, Order, MedicalRecord, Notification } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('paws_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('paws_token');
      localStorage.removeItem('paws_user');
      window.location.href = '/login';
    }
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
};

export const api = {
  auth: {
    signup: (data: any) => fetch(`${API_BASE}/auth/signup`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    login: (data: any) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    profile: () => fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() }).then(handleResponse),
    updateProfile: (data: { name: string, address: string, phone: string }) => fetch(`${API_BASE}/auth/profile`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  },
  pets: {
    list: (status?: string) => fetch(`${API_BASE}/pets${status ? `?status=${status}` : ''}`).then(handleResponse),
    listAll: () => fetch(`${API_BASE}/pets/all`, { headers: getHeaders() }).then(handleResponse),
    create: (data: any) => fetch(`${API_BASE}/pets`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    updateStatus: (id: number, status: string) => fetch(`${API_BASE}/pets/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  },
  adoptions: {
    apply: (data: any) => fetch(`${API_BASE}/adoptions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    my: () => fetch(`${API_BASE}/adoptions/my`, { headers: getHeaders() }).then(handleResponse),
    all: () => fetch(`${API_BASE}/adoptions/all`, { headers: getHeaders() }).then(handleResponse),
    updateStatus: (id: number, status: string) => fetch(`${API_BASE}/adoptions/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  },
  shop: {
    products: () => fetch(`${API_BASE}/products`).then(handleResponse),
    create: (data: any) => fetch(`${API_BASE}/products`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id: number, data: any) => fetch(`${API_BASE}/products/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: number) => fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  },
  cart: {
    get: () => fetch(`${API_BASE}/cart`, { headers: getHeaders() }).then(handleResponse),
    add: (product_id: number, quantity: number) => fetch(`${API_BASE}/cart`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ product_id, quantity }) }).then(handleResponse),
    update: (id: number, quantity: number) => fetch(`${API_BASE}/cart/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ quantity }) }).then(handleResponse),
    remove: (id: number) => fetch(`${API_BASE}/cart/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  },
  orders: {
    create: () => fetch(`${API_BASE}/orders/create`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
    verify: (data: any) => fetch(`${API_BASE}/orders/verify`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    my: () => fetch(`${API_BASE}/orders/my`, { headers: getHeaders() }).then(handleResponse),
    all: () => fetch(`${API_BASE}/orders/all`, { headers: getHeaders() }).then(handleResponse),
    updateStatus: (id: number, status: string) => fetch(`${API_BASE}/orders/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  },
  medical: {
    get: (petId: number) => fetch(`${API_BASE}/medical/${petId}`, { headers: getHeaders() }).then(handleResponse),
    add: (data: any) => fetch(`${API_BASE}/medical`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    sendReminder: (data: { pet_id: number, message: string }) => fetch(`${API_BASE}/reminders`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  },
  notifications: {
    get: () => fetch(`${API_BASE}/notifications`, { headers: getHeaders() }).then(handleResponse),
    markRead: (id: number) => fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),
  },
};
