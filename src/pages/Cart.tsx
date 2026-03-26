// Railway redeploy trigger
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { CartItem } from '../types';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare const Razorpay: any;

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadCart();
  }, [user]);

  const loadCart = () => {
    api.cart.get().then(setItems).finally(() => setLoading(false));
  };

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.cart.update(id, quantity);
      loadCart();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRemove = async (id: number) => {
    try {
      await api.cart.remove(id);
      loadCart();
      toast.success('Item removed.');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleCheckout = async () => {
    if (!user?.address || !user?.phone) {
      toast.error('Please add your delivery address and phone number in your profile.', {
        action: { label: 'Go to Profile', onClick: () => navigate('/dashboard') }
      });
      return;
    }
    try {
      const { rzpOrder, orderId } = await api.orders.create();
      const options = {
        key: 'rzp_test_SVScCOC0D3Twzu',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Paws Pet Shop',
        description: 'Order Payment',
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          try {
            await api.orders.verify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, orderId });
            toast.success('Payment successful. Order placed.');
            navigate('/orders');
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#B8860B' },
      };
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => toast.error('Payment failed: ' + response.error.description));
      rzp.open();
    } catch (err: any) { toast.error(err.message); }
  };

  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  if (loading) return (
    <div className="p-20 text-center" style={{ color: 'var(--muted-foreground)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading cart...
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-32 text-center">
        <div
          className="w-16 h-16 flex items-center justify-center rounded mx-auto mb-8"
          style={{ background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)' }}
        >
          <ShoppingBag className="h-7 w-7" style={{ color: 'var(--accent)' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '0.75rem' }}>
          Your cart is empty
        </h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem', lineHeight: 1.75 }}>
          You haven't added anything yet. Explore our curated shop.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
          style={{ background: 'var(--accent)', color: 'white' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <span style={{ height: '1px', width: '32px', background: 'var(--border)' }} />
            <span className="label-caps">Your Order</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 400, color: 'var(--foreground)' }}>
            Shopping Cart
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-grow space-y-4">
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-5 p-5"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(26,26,26,0.04)',
                }}
              >
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400'}
                  alt={item.name}
                  className="rounded object-cover flex-shrink-0"
                  style={{ width: '72px', height: '72px', border: '1px solid var(--border)' }}
                  referrerPolicy="no-referrer"
                />
                <div className="flex-grow">
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.05rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.2rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--accent)', marginBottom: '0.75rem' }}>₹{item.price}</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center gap-1"
                      style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 6px' }}
                    >
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="p-1.5" style={{ color: 'var(--muted-foreground)' }}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span style={{ width: '1.75rem', textAlign: 'center', fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '0.95rem', color: 'var(--foreground)' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="p-1.5" style={{ color: 'var(--muted-foreground)' }}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded transition-colors duration-200"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>
                    ₹{(item.price || 0) * item.quantity}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div
              className="sticky top-24 p-7"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 4px rgba(26,26,26,0.04)' }}
            >
              <div style={{ height: '2px', background: 'var(--accent)', margin: '-1.75rem -1.75rem 1.75rem', borderRadius: '8px 8px 0 0' }} />
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '1.5rem' }}>
                Order Summary
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Subtotal</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Shipping</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>Free</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border)' }} />
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--foreground)' }}>₹{total}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                style={{ background: 'var(--accent)', color: 'white', fontSize: '0.95rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
