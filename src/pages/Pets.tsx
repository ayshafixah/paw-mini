// Railway redeploy trigger
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Pet } from '../types';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { Heart, X } from 'lucide-react';

const inputStyle = {
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

const InputField = ({ label, ...props }: any) => (
  <div>
    <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>
      {label}
    </label>
    <input
      {...props}
      style={inputStyle}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  </div>
);

export default function Pets() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [applicationText, setApplicationText] = useState('');
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', species: 'Dog', breed: '', age: '', description: '', image_url: '' });

  useEffect(() => {
    api.pets.list('available').then(setPets).finally(() => setLoading(false));
  }, []);

  const handlePetSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.pets.create(newPet);
      toast.success('Pet submitted for approval.');
      setIsSubmittingPet(false);
      setNewPet({ name: '', species: 'Dog', breed: '', age: '', description: '', image_url: '' });
    } catch (err: any) { toast.error(err.message); }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to apply for adoption'); return; }
    try {
      await api.adoptions.apply({ pet_id: selectedPet?.id, application_text: applicationText });
      toast.success('Application submitted successfully.');
      setSelectedPet(null);
      setApplicationText('');
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return (
    <div className="p-20 text-center" style={{ color: 'var(--muted-foreground)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading pets...
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span style={{ height: '1px', width: '32px', background: 'var(--border)' }} />
              <span className="label-caps">Available for Adoption</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--foreground)', lineHeight: 1.15 }}>
              Adopt a Friend
            </h1>
            <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem', lineHeight: 1.75 }}>
              Browse our available pets and find your perfect match.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setIsSubmittingPet(true)}
              className="px-6 py-3 rounded font-medium transition-all duration-200 min-h-[44px] flex-shrink-0"
              style={{ border: '1px solid var(--foreground)', color: 'var(--foreground)', fontFamily: "'Source Sans 3', sans-serif", fontSize: '0.9rem' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--foreground)'; (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; }}
            >
              Submit a Pet
            </button>
          )}
        </div>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pets.map((pet, i) => (
            <motion.div
              key={pet.id}
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
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={pet.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'}
                  alt={pet.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded"
                  style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(6px)' }}
                >
                  <span className="label-caps" style={{ fontSize: '0.58rem' }}>{pet.species}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.25rem' }}>{pet.name}</h3>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>
                  {pet.breed} · {pet.age} yrs
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {pet.description}
                </p>
                <button
                  onClick={() => setSelectedPet(pet)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: 'var(--foreground)', color: 'white', fontSize: '0.9rem' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--foreground)'; }}
                >
                  <Heart className="h-3.5 w-3.5" />
                  Adopt Me
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Pet Modal */}
        {isSubmittingPet && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg relative"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(26,26,26,0.15)' }}
            >
              <button onClick={() => setIsSubmittingPet(false)} className="absolute top-5 right-5" style={{ color: 'var(--muted-foreground)' }}>
                <X className="h-5 w-5" />
              </button>
              <div style={{ height: '2px', background: 'var(--accent)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '8px 8px 0 0' }} />

              <div className="flex items-center gap-4 mb-3">
                <span className="label-caps">New Submission</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Submit a Pet</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Help a pet find their forever home.</p>

              <form onSubmit={handlePetSubmission} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Pet Name" type="text" required value={newPet.name} onChange={(e: any) => setNewPet({ ...newPet, name: e.target.value })} />
                  <div>
                    <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>Species</label>
                    <select
                      value={newPet.species}
                      onChange={e => setNewPet({ ...newPet, species: e.target.value })}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Breed" type="text" required value={newPet.breed} onChange={(e: any) => setNewPet({ ...newPet, breed: e.target.value })} />
                  <InputField label="Age (Years)" type="number" required value={newPet.age} onChange={(e: any) => setNewPet({ ...newPet, age: e.target.value })} />
                </div>
                <InputField label="Image URL" type="url" value={newPet.image_url} onChange={(e: any) => setNewPet({ ...newPet, image_url: e.target.value })} placeholder="https://..." />
                <div>
                  <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>Description</label>
                  <textarea
                    required
                    value={newPet.description}
                    onChange={e => setNewPet({ ...newPet, description: e.target.value })}
                    style={{ ...inputStyle, height: '96px', padding: '0.75rem 1rem', resize: 'none' }}
                    onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
                    onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: 'var(--accent)', color: 'white', fontSize: '0.95rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Submit for Approval
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Adoption Modal */}
        {selectedPet && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg relative"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(26,26,26,0.15)' }}
            >
              <div style={{ height: '2px', background: 'var(--accent)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '8px 8px 0 0' }} />
              <button onClick={() => setSelectedPet(null)} className="absolute top-5 right-5" style={{ color: 'var(--muted-foreground)' }}>
                <X className="h-5 w-5" />
              </button>

              <span className="label-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>Adoption Application</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                Adopt {selectedPet.name}
              </h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                Tell us why you'd be a wonderful parent for this pet.
              </p>

              <form onSubmit={handleApply} className="space-y-5">
                <div>
                  <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>Your Application</label>
                  <textarea
                    required
                    value={applicationText}
                    onChange={e => setApplicationText(e.target.value)}
                    placeholder="I have a large backyard and plenty of time to play..."
                    style={{ ...inputStyle, height: '130px', padding: '0.75rem 1rem', resize: 'none' }}
                    onFocus={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
                    onBlur={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{ background: 'var(--accent)', color: 'white', fontSize: '0.95rem' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Submit Application
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
