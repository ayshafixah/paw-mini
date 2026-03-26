// Railway redeploy trigger
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Product } from '../types';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';

export default function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.shop.products().then(setProducts).finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add items to cart'); return; }
    if (quantity > (selectedProduct?.stock || 0)) { toast.error('Not enough stock available'); return; }
    try {
      await api.cart.add(selectedProduct!.id, quantity);
      toast.success('Added to cart.');
      setSelectedProduct(null);
      setQuantity(1);
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="p-20 text-center" style={{ color: 'var(--muted-foreground)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading products...
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-3">
            <span style={{ height: '1px', width: '32px', background: 'var(--border)' }} />
            <span className="label-caps">Premium Supplies</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--foreground)', lineHeight: 1.15 }}>
            Pet Shop
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem', lineHeight: 1.75 }}>
            Curated food, toys, and accessories for your beloved companions.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(26,26,26,0.04)',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(26,26,26,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(184,134,11,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(26,26,26,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent), var(--accent-secondary))' }} />
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded"
                  style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(6px)' }}
                >
                  <span className="label-caps" style={{ fontSize: '0.58rem' }}>{product.category}</span>
                </div>
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(250,250,248,0.85)', backdropFilter: 'blur(2px)' }}>
                    <span className="label-caps" style={{ color: 'var(--muted-foreground)' }}>Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.1rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.25rem' }}>{product.name}</h3>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem' }}>₹{product.price}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                    {product.stock} in stock
                  </span>
                  <button
                    onClick={() => { setSelectedProduct(product); setQuantity(1); }}
                    disabled={product.stock === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 min-h-[40px]"
                    style={{ background: product.stock === 0 ? 'var(--muted)' : 'var(--foreground)', color: product.stock === 0 ? 'var(--muted-foreground)' : 'white', fontSize: '0.8rem', cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
                    onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
                    onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLElement).style.background = 'var(--foreground)'; }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-2xl relative flex flex-col md:flex-row overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 20px 60px rgba(26,26,26,0.15)' }}
            >
              <div style={{ height: '2px', background: 'var(--accent)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }} />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded"
                style={{ background: 'rgba(250,250,248,0.9)', backdropFilter: 'blur(6px)', color: 'var(--muted-foreground)' }}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="md:w-5/12 aspect-square md:aspect-auto">
                <img
                  src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  style={{ minHeight: '260px' }}
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="md:w-7/12 p-8 flex flex-col justify-center">
                <span className="label-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>{selectedProduct.category}</span>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                  {selectedProduct.name}
                </h2>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 500, color: 'var(--accent)', marginBottom: '1rem' }}>
                  ₹{selectedProduct.price}
                </p>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  {selectedProduct.description}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="flex items-center gap-1"
                    style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px' }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 rounded transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span style={{ width: '2rem', textAlign: 'center', fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--foreground)', fontSize: '1rem' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      className="p-1.5 rounded transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                    {selectedProduct.stock} remaining
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: 'var(--accent)', color: 'white', fontSize: '0.95rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
