// Railway redeploy trigger
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Pet, MedicalRecord, Order } from '../types';
import { toast } from 'sonner';
import { Stethoscope, PawPrint, Plus, X, Bell, ShoppingBag, Package, Info, Calendar } from 'lucide-react';

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
  transition: 'border-color 0.15s ease',
};

const statusBadge = (status: string): React.CSSProperties => {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '4px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase' };
  if (['paid', 'available'].includes(status)) return { ...base, background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' };
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

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<'medical' | 'orders'>('medical');
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [newRecord, setNewRecord] = useState({ vaccination_date: '', next_due_date: '', notes: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [petsData, ordersData] = await Promise.all([api.pets.listAll(), api.orders.all()]);
      setPets(petsData); setOrders(ordersData);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSelectPet = async (pet: Pet) => {
    setSelectedPet(pet);
    try { const records = await api.medical.get(pet.id); setMedicalRecords(records); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try { await api.orders.updateStatus(id, status); toast.success(`Order ${status}.`); loadData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.medical.add({ ...newRecord, pet_id: selectedPet?.id });
      toast.success('Medical record added.');
      setIsAddingRecord(false);
      handleSelectPet(selectedPet!);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.medical.sendReminder({ pet_id: selectedPet!.id, message: reminderMessage });
      toast.success('Reminder sent to owner.');
      setIsSendingReminder(false);
      setReminderMessage('');
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="p-20 text-center" style={{ color: 'var(--muted-foreground)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span style={{ height: '1px', width: '32px', background: 'var(--border)' }} />
              <span className="label-caps">Staff Portal</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 400, color: 'var(--foreground)' }}>
              Staff Dashboard
            </h1>
          </div>

          <div
            className="flex gap-1 p-1 rounded"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {[
              { id: 'medical', icon: Stethoscope, label: 'Medical Records' },
              { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2 px-5 py-2 rounded transition-all duration-200"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.62rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: activeTab === tab.id ? 'var(--card)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted-foreground)',
                  border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(26,26,26,0.08)' : 'none',
                }}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Medical Tab */}
          {activeTab === 'medical' && (
            <motion.div
              key="medical"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              {/* Pets List */}
              <section className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-5">
                  <PawPrint className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 500, color: 'var(--foreground)' }}>All Pets</h2>
                </div>
                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1rem' }} />
                <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                  {pets.map(pet => (
                    <button
                      key={pet.id}
                      onClick={() => handleSelectPet(pet)}
                      className="w-full text-left flex items-center gap-3 p-3 rounded transition-all duration-200"
                      style={{
                        background: selectedPet?.id === pet.id ? 'rgba(184,134,11,0.06)' : 'var(--card)',
                        border: selectedPet?.id === pet.id ? '1px solid rgba(184,134,11,0.3)' : '1px solid var(--border)',
                        boxShadow: selectedPet?.id === pet.id ? '0 0 0 1px rgba(184,134,11,0.15)' : '0 1px 2px rgba(26,26,26,0.04)',
                      }}
                    >
                      <img
                        src={pet.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
                        alt={pet.name}
                        className="rounded object-cover flex-shrink-0"
                        style={{ width: '40px', height: '40px', border: '1px solid var(--border)' }}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '0.95rem', color: 'var(--foreground)' }}>{pet.name}</p>
                        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                          {pet.species} · {pet.status.replace('_', ' ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Medical Records Panel */}
              <section className="lg:col-span-2">
                {selectedPet ? (
                  <motion.div key={selectedPet.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 flex items-center justify-center rounded"
                          style={{ background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)' }}
                        >
                          <Stethoscope className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                        </div>
                        <div>
                          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--foreground)' }}>
                            {selectedPet.name}'s Health Record
                          </h2>
                          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                            Medical history
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsSendingReminder(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded transition-all duration-200 min-h-[40px]"
                          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)', fontFamily: "'Source Sans 3', sans-serif", fontSize: '0.85rem' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'; }}
                        >
                          <Bell className="h-3.5 w-3.5" />
                          Remind
                        </button>
                        <button
                          onClick={() => setIsAddingRecord(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded transition-all duration-200 min-h-[40px]"
                          style={{ background: 'var(--accent)', color: 'white', fontFamily: "'Source Sans 3', sans-serif", fontSize: '0.85rem' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Record
                        </button>
                      </div>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.25rem' }} />

                    <div className="space-y-4">
                      {medicalRecords.length === 0 ? (
                        <div
                          className="p-12 text-center rounded-lg"
                          style={{ border: '1px dashed var(--border)' }}
                        >
                          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--muted-foreground)', fontSize: '1rem' }}>
                            No medical records for {selectedPet.name} yet.
                          </p>
                        </div>
                      ) : medicalRecords.map(record => (
                        <div
                          key={record.id}
                          className="p-5"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}
                        >
                          <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent), var(--accent-secondary))', margin: '-1.25rem -1.25rem 1.25rem', borderRadius: '8px 8px 0 0' }} />
                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                              <p className="label-caps" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.58rem' }}>Vaccination Date</p>
                              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--foreground)', fontSize: '1rem' }}>
                                {new Date(record.vaccination_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '0.25rem' }}>
                                Next Due Date
                              </p>
                              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--accent)', fontSize: '1rem' }}>
                                {new Date(record.next_due_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="label-caps" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.58rem' }}>Notes</p>
                            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.75, fontSize: '0.9rem' }}>{record.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div
                    className="h-full flex flex-col items-center justify-center p-16 text-center rounded-lg"
                    style={{ border: '1px dashed var(--border)', minHeight: '300px' }}
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded mb-5"
                      style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                    >
                      <Info className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                      Select a Pet
                    </h3>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                      Choose a pet from the list to view their medical history.
                    </p>
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
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

        {/* Send Reminder Modal */}
        {isSendingReminder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg relative"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(26,26,26,0.15)' }}
            >
              <div style={{ height: '2px', background: 'var(--accent)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '8px 8px 0 0' }} />
              <button onClick={() => setIsSendingReminder(false)} className="absolute top-5 right-5" style={{ color: 'var(--muted-foreground)' }}><X className="h-5 w-5" /></button>
              <span className="label-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>Notification</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Send Reminder</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                This will notify the owner of {selectedPet?.name}.
              </p>
              <form onSubmit={handleSendReminder} className="space-y-5">
                <div>
                  <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>
                    Message
                  </label>
                  <textarea
                    required
                    placeholder={`e.g., Reminder: ${selectedPet?.name} is due for an annual checkup.`}
                    value={reminderMessage}
                    onChange={e => setReminderMessage(e.target.value)}
                    style={{ ...inputStyle, height: '120px', padding: '0.75rem 1rem', resize: 'none' }}
                    onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: 'var(--accent)', color: 'white', fontSize: '0.95rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Send Notification
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Record Modal */}
        {isAddingRecord && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg relative"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(26,26,26,0.15)' }}
            >
              <div style={{ height: '2px', background: 'var(--accent)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '8px 8px 0 0' }} />
              <button onClick={() => setIsAddingRecord(false)} className="absolute top-5 right-5" style={{ color: 'var(--muted-foreground)' }}><X className="h-5 w-5" /></button>
              <span className="label-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>Health Record</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Add Medical Record</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Recording health data for {selectedPet?.name}.</p>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Vaccination Date', key: 'vaccination_date' },
                    { label: 'Next Due Date', key: 'next_due_date' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>
                        {label}
                      </label>
                      <input
                        type="date"
                        required
                        style={inputStyle}
                        value={(newRecord as any)[key]}
                        onChange={e => setNewRecord({ ...newRecord, [key]: e.target.value })}
                        onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>
                    Clinical Notes
                  </label>
                  <textarea
                    required
                    placeholder="Details about the checkup..."
                    value={newRecord.notes}
                    onChange={e => setNewRecord({ ...newRecord, notes: e.target.value })}
                    style={{ ...inputStyle, height: '100px', padding: '0.75rem 1rem', resize: 'none' }}
                    onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: 'var(--accent)', color: 'white', fontSize: '0.95rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Save Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
