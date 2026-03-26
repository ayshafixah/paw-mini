// Railway redeploy trigger
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Adoption, Order, User } from '../types';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { Heart, Package, User as UserIcon, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  height: '44px',
  padding: '0 1rem',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  background: 'transparent',
  color: 'var(--foreground)',
  fontSize: '0.95rem',
  fontFamily: "'Source Sans 3', sans-serif",
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const statusStyle = (status: string) => {
  if (status === 'approved' || status === 'paid') return { background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' };
  if (status === 'rejected') return { background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' };
  if (status === 'shipped') return { background: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' };
  return { background: 'rgba(184,134,11,0.08)', color: 'var(--accent)', border: '1px solid rgba(184,134,11,0.2)' };
};

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([api.adoptions.my(), api.orders.my()])
        .then(([adoptionsData, ordersData]) => { setAdoptions(adoptionsData); setOrders(ordersData); })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await api.auth.updateProfile({ name, address, phone });
      updateUser(updated);
      toast.success('Profile updated.');
    } catch (err: any) { toast.error(err.message); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="p-20 text-center" style={{ color: 'var(--muted-foreground)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-3">
            <span style={{ height: '1px', width: '32px', background: 'var(--border)' }} />
            <span className="label-caps">My Account</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 400, color: 'var(--foreground)', lineHeight: 1.15 }}>
            Hello, <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{user?.name?.split(' ')[0]}</em>
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '0.4rem', lineHeight: 1.75 }}>
            Manage your adoptions, orders, and profile details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Profile Form */}
          <section className="lg:col-span-1">
            <div
              className="sticky top-24 p-7"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 4px rgba(26,26,26,0.04)' }}
            >
              <div style={{ height: '2px', background: 'var(--accent)', margin: '-1.75rem -1.75rem 1.75rem', borderRadius: '8px 8px 0 0' }} />
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded"
                  style={{ background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.15)' }}
                >
                  <UserIcon className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.15rem', fontWeight: 500, color: 'var(--foreground)' }}>Profile Details</h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {[
                  { label: 'Full Name', type: 'text', value: name, setter: setName, required: true },
                  { label: 'Phone Number', type: 'tel', value: phone, setter: setPhone, placeholder: '+91 98765 43210', required: true },
                ].map(({ label, type, value, setter, placeholder, required }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      required={required}
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={placeholder}
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>
                    Delivery Address
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street, City, State, PIN"
                    style={{ ...inputStyle, height: '100px', padding: '0.75rem 1rem', resize: 'none' }}
                    onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
                    onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: updating ? 'var(--border)' : 'var(--foreground)', color: 'white', fontSize: '0.9rem', opacity: updating ? 0.7 : 1 }}
                  onMouseEnter={e => { if (!updating) (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
                  onMouseLeave={e => { if (!updating) (e.currentTarget as HTMLElement).style.background = 'var(--foreground)'; }}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </section>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Adoptions */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Heart className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, color: 'var(--foreground)' }}>My Adoptions</h2>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.25rem' }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adoptions.length === 0 ? (
                  <div
                    className="md:col-span-2 p-10 text-center rounded-lg"
                    style={{ border: '1px dashed var(--border)' }}
                  >
                    <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--muted-foreground)', fontSize: '1rem' }}>No adoption applications yet.</p>
                  </div>
                ) : adoptions.map(adoption => (
                  <motion.div
                    key={adoption.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}
                  >
                    <img
                      src={adoption.pet_image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
                      alt={adoption.pet_name}
                      className="rounded object-cover flex-shrink-0"
                      style={{ width: '56px', height: '56px', border: '1px solid var(--border)' }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-grow min-w-0">
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {adoption.pet_name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        <Calendar className="h-3 w-3" />
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {new Date(adoption.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded"
                        style={{ ...statusStyle(adoption.status), fontSize: '0.62rem', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}
                      >
                        {adoption.status === 'approved' ? <CheckCircle className="h-3 w-3" /> : adoption.status === 'rejected' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {adoption.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Orders */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Package className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, color: 'var(--foreground)' }}>My Orders</h2>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.25rem' }} />
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div
                    className="p-10 text-center rounded-lg"
                    style={{ border: '1px dashed var(--border)' }}
                  >
                    <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--muted-foreground)', fontSize: '1rem' }}>No orders placed yet.</p>
                  </div>
                ) : orders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-5"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}
                  >
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.05rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                        Order #{order.id}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                          <Calendar className="h-3 w-3" />
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--accent)', fontSize: '0.95rem' }}>
                          ₹{order.total_amount}
                        </span>
                      </div>
                    </div>
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded"
                      style={{ ...statusStyle(order.status), fontSize: '0.62rem', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      {order.status === 'paid' ? <CheckCircle className="h-3 w-3" /> : order.status === 'shipped' ? <Package className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {order.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
