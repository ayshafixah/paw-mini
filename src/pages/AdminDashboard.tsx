// Railway redeploy trigger
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Adoption, Pet, Product, Order } from '../types';
import { toast } from 'sonner';
import { LayoutDashboard, Heart, PawPrint, Package, Check, X, Plus, Trash2, ShoppingBag } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  height: '44px',
  padding: '0 1rem',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  background: 'transparent',
  color: 'var(--foreground)',
  fontSize: '0.9rem',
  fontFamily: "'Source Sans 3', sans-serif",
  width: '100%',
  outline: 'none',
};

const statusBadge = (status: string) => {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const };
  if (['approved', 'paid', 'available'].includes(status)) return { ...base, background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' };
  if (['rejected'].includes(status)) return { ...base, background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' };
  if (['shipped'].includes(status)) return { ...base, background: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' };
  return { ...base, background: 'rgba(184,134,11,0.08)', color: 'var(--accent)', border: '1px solid rgba(184,134,11,0.2)' };
};

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1.25rem',
  textAlign: 'left',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '0.6rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  fontWeight: 500,
  borderBottom: '1px solid var(--border)',
  background: 'var(--muted)',
};

const tdStyle: React.CSSProperties = {
  padding: '0.875rem 1.25rem',
  borderBottom: '1px solid var(--border)',
  color: 'var(--foreground)',
  fontSize: '0.9rem',
  verticalAlign: 'middle',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'adoptions' | 'pets' | 'inventory' | 'orders'>('overview');
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', description: '', price: 0, stock: 0, category: 'Food', image_url: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, p, pr, o] = await Promise.all([api.adoptions.all(), api.pets.listAll(), api.shop.products(), api.orders.all()]);
      setAdoptions(a); setPets(p); setProducts(pr); setOrders(o);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleUpdateAdoption = async (id: number, status: string) => {
    try { await api.adoptions.updateStatus(id, status); toast.success(`Adoption ${status}.`); loadData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleUpdatePetStatus = async (id: number, status: string) => {
    try { await api.pets.updateStatus(id, status); toast.success(`Pet ${status}.`); loadData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try { await api.orders.updateStatus(id, status); toast.success(`Order ${status}.`); loadData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.shop.create(newProduct); toast.success('Product added.'); setIsAddingProduct(false); loadData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try { await api.shop.delete(id); toast.success('Product deleted.'); loadData(); }
    catch (err: any) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="p-20 text-center" style={{ color: 'var(--muted-foreground)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading admin dashboard...
    </div>
  );

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'adoptions', icon: Heart, label: 'Adoptions' },
    { id: 'pets', icon: PawPrint, label: 'Pets' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
  ];

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span style={{ height: '1px', width: '32px', background: 'var(--border)' }} />
              <span className="label-caps">Platform Management</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 400, color: 'var(--foreground)' }}>
              Admin Dashboard
            </h1>
          </div>

          {/* Tab Bar */}
          <div
            className="flex gap-1 p-1 rounded overflow-x-auto"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', flexShrink: 0 }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 whitespace-nowrap"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.62rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: activeTab === tab.id ? 'var(--card)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted-foreground)',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(26,26,26,0.08)' : 'none',
                  border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Adoptions', value: adoptions.length },
                  { label: 'Pending Pets', value: pets.filter(p => p.status === 'pending_approval').length },
                  { label: 'Total Products', value: products.length },
                  { label: 'Total Revenue', value: `₹${orders.reduce((s, o) => s + o.total_amount, 0).toLocaleString()}` },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-6"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}
                  >
                    <div style={{ height: '2px', background: 'var(--accent)', margin: '-1.5rem -1.5rem 1.5rem', borderRadius: '8px 8px 0 0' }} />
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                      {stat.label}
                    </p>
                    <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: 'var(--foreground)', lineHeight: 1 }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Adoptions Table */}
          {activeTab === 'adoptions' && (
            <motion.div key="adoptions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}>
                <div style={{ height: '2px', background: 'var(--accent)' }} />
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Pet', 'Applicant', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {adoptions.map(a => (
                        <tr key={a.id} style={{ transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={tdStyle}>
                            <p style={{ fontWeight: 600, color: 'var(--foreground)' }}>{a.pet_name}</p>
                            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                              ID: {a.pet_id}
                            </p>
                          </td>
                          <td style={tdStyle}>
                            <p style={{ fontWeight: 500 }}>{a.user_name}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{a.user_email}</p>
                          </td>
                          <td style={tdStyle}><span style={statusBadge(a.status)}>{a.status}</span></td>
                          <td style={tdStyle}>
                            {a.status === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleUpdateAdoption(a.id, 'approved')} className="p-1.5 rounded transition-colors" style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}><Check className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleUpdateAdoption(a.id, 'rejected')} className="p-1.5 rounded transition-colors" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}><X className="h-3.5 w-3.5" /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pets Table */}
          {activeTab === 'pets' && (
            <motion.div key="pets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}>
                <div style={{ height: '2px', background: 'var(--accent)' }} />
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Pet Name', 'Species / Breed', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {pets.map(pet => (
                        <tr key={pet.id}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          style={{ transition: 'background 0.15s' }}
                        >
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{pet.name}</td>
                          <td style={{ ...tdStyle, color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{pet.species} / {pet.breed}</td>
                          <td style={tdStyle}><span style={statusBadge(pet.status)}>{pet.status.replace('_', ' ')}</span></td>
                          <td style={tdStyle}>
                            {pet.status === 'pending_approval' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleUpdatePetStatus(pet.id, 'available')} className="p-1.5 rounded" style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}><Check className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleUpdatePetStatus(pet.id, 'rejected')} className="p-1.5 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}><X className="h-3.5 w-3.5" /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Inventory */}
          {activeTab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded transition-all duration-200 min-h-[40px]"
                  style={{ background: 'var(--accent)', color: 'white', fontFamily: "'Source Sans 3', sans-serif", fontSize: '0.9rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="p-5"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}
                  >
                    <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent), var(--accent-secondary))', margin: '-1.25rem -1.25rem 1.25rem', borderRadius: '8px 8px 0 0' }} />
                    <div className="flex justify-between items-start mb-3">
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 500, color: 'var(--foreground)' }}>{product.name}</h3>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                        {product.stock} in stock
                      </span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 500, color: 'var(--accent)' }}>₹{product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Table */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}>
                <div style={{ height: '2px', background: 'var(--accent)' }} />
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Order', 'Customer', 'Delivery', 'Total', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          style={{ transition: 'background 0.15s' }}
                        >
                          <td style={{ ...tdStyle, fontWeight: 600 }}>#{order.id}</td>
                          <td style={tdStyle}>
                            <p style={{ fontWeight: 500 }}>{order.user_name}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>{(order as any).user_email}</p>
                          </td>
                          <td style={tdStyle}>
                            <p style={{ fontSize: '0.85rem' }}>{(order as any).address || '—'}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>{(order as any).phone}</p>
                          </td>
                          <td style={{ ...tdStyle, fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--accent)' }}>₹{order.total_amount}</td>
                          <td style={tdStyle}><span style={statusBadge(order.status)}>{order.status}</span></td>
                          <td style={tdStyle}>
                            {order.status === 'paid' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                                style={{ background: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                              >
                                <Package className="h-3 w-3" />
                                Ship
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg relative"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(26,26,26,0.15)' }}
            >
              <div style={{ height: '2px', background: 'var(--accent)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '8px 8px 0 0' }} />
              <button onClick={() => setIsAddingProduct(false)} className="absolute top-5 right-5" style={{ color: 'var(--muted-foreground)' }}>
                <X className="h-5 w-5" />
              </button>
              <span className="label-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>New Item</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '1.75rem' }}>
                Add Product
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                {[
                  { placeholder: 'Product Name', key: 'name', type: 'text' },
                  { placeholder: 'Image URL', key: 'image_url', type: 'url' },
                ].map(({ placeholder, key, type }) => (
                  <input
                    key={key}
                    type={type}
                    placeholder={placeholder}
                    required={key === 'name'}
                    style={inputStyle}
                    value={(newProduct as any)[key]}
                    onChange={e => setNewProduct({ ...newProduct, [key]: e.target.value })}
                    onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
                    onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                ))}
                <textarea
                  placeholder="Description"
                  required
                  style={{ ...inputStyle, height: '80px', padding: '0.75rem 1rem', resize: 'none' }}
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { placeholder: 'Price (₹)', key: 'price' },
                    { placeholder: 'Stock', key: 'stock' },
                  ].map(({ placeholder, key }) => (
                    <input
                      key={key}
                      type="number"
                      required
                      placeholder={placeholder}
                      style={inputStyle}
                      value={(newProduct as any)[key]}
                      onChange={e => setNewProduct({ ...newProduct, [key]: Number(e.target.value) })}
                      onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: 'var(--accent)', color: 'white', fontSize: '0.95rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Add Product
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
