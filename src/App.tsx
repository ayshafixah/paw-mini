// Railway redeploy trigger
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  ShoppingCart,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PawPrint,
  Heart,
  Stethoscope,
  Package,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "./lib/api";
import { User, Notification, Role, Pet } from "./types";

// --- AUTH CONTEXT ---
interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("paws_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("paws_token", token);
    localStorage.setItem("paws_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("paws_token");
    localStorage.removeItem("paws_user");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("paws_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- NAVBAR ---
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (user)
      api.notifications.get().then(setNotifications).catch(console.error);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const navLinks = [
    { name: "Browse Pets", path: "/pets" },
    { name: "Shop", path: "/shop" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(250,250,248,0.95)" : "var(--background)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              className="w-8 h-8 flex items-center justify-center rounded transition-colors duration-200"
              style={{ background: "var(--accent)" }}
            >
              <PawPrint className="h-4 w-4" style={{ color: "white" }} />
            </div>
            <span
              className="text-xl tracking-tight"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Paws
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="transition-colors duration-200 hover:opacity-60"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                {link.name}
              </Link>
            ))}

            <div
              style={{
                width: "1px",
                height: "20px",
                background: "var(--border)",
              }}
            />

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/notifications"
                  className="relative p-2 transition-colors duration-200"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-foreground)")
                  }
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: "var(--accent)", lineHeight: 1 }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="p-2 transition-colors duration-200"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-foreground)")
                  }
                >
                  <ShoppingCart className="h-4 w-4" />
                </Link>
                <Link
                  to={
                    user.role === "admin"
                      ? "/admin"
                      : user.role === "staff"
                      ? "/staff"
                      : "/dashboard"
                  }
                  className="flex items-center space-x-2 px-4 py-2 rounded transition-all duration-200"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--foreground)";
                  }}
                >
                  <UserIcon className="h-3 w-3" />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 transition-colors duration-200"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#dc2626")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-foreground)")
                  }
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                  }}
                  className="transition-colors duration-200 hover:opacity-70"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded text-sm font-medium transition-all duration-200"
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--accent-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--accent)")
                  }
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 transition-colors duration-200"
            style={{ color: "var(--muted-foreground)" }}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              borderTop: "1px solid var(--border)",
              background: "var(--background)",
            }}
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 transition-colors duration-200"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block py-2"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="block py-2"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Cart
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block py-2 text-red-500"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-2"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block py-2"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- HOME PAGE ---
const Home = () => {
  const [featuredPets, setFeaturedPets] = useState<Pet[]>([]);

  useEffect(() => {
    api.pets
      .list("available")
      .then((pets) => setFeaturedPets(pets.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <div style={{ background: "var(--background)" }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ paddingTop: "7rem", paddingBottom: "7rem" }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span
              style={{
                flex: 1,
                maxWidth: "80px",
                height: "1px",
                background: "var(--border)",
              }}
            />
            <span className="label-caps">
              India's Premier Pet Adoption Platform
            </span>
            <span
              style={{
                flex: 1,
                maxWidth: "80px",
                height: "1px",
                background: "var(--border)",
              }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "var(--foreground)",
              marginBottom: "1.5rem",
            }}
          >
            Find Your Forever
            <br />
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
              Companion
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mb-12"
            style={{
              maxWidth: "520px",
              fontSize: "1.125rem",
              color: "var(--muted-foreground)",
              lineHeight: 1.8,
            }}
          >
            We connect lonely hearts with forever homes. Adopt a pet, buy
            premium supplies, and track health records—all in one refined place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/pets"
              className="inline-flex items-center justify-center px-10 py-4 rounded font-medium transition-all duration-200 min-h-[44px]"
              style={{
                background: "var(--accent)",
                color: "white",
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-secondary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              Adopt a Pet
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-10 py-4 rounded font-medium transition-all duration-200 min-h-[44px]"
              style={{
                border: "1px solid var(--foreground)",
                color: "var(--foreground)",
                fontSize: "0.95rem",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--accent)";
                (e.currentTarget as HTMLElement).style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--foreground)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--foreground)";
              }}
            >
              Shop Supplies
            </Link>
          </motion.div>
        </div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-5xl mx-auto px-6 lg:px-8 mt-20"
        >
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              border: "1px solid var(--border)",
              boxShadow: "0 8px 40px rgba(26,26,26,0.08)",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=1600"
              alt="Happy pets"
              className="w-full object-cover"
              style={{ height: "clamp(280px, 40vw, 480px)" }}
              referrerPolicy="no-referrer"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(26,26,26,0.35) 0%, transparent 60%)",
              }}
            />

            {/* Floating stats */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3">
              {[
                { value: "2,500+", label: "Pets Adopted" },
                { value: "1,800+", label: "Happy Families" },
                { value: "45+", label: "Shelter Partners" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="px-5 py-3 rounded"
                  style={{
                    background: "rgba(250,250,248,0.92)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.4)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Featured Pets Section */}
      <section style={{ padding: "6rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span
                  style={{
                    height: "1px",
                    width: "40px",
                    background: "var(--border)",
                  }}
                />
                <span className="label-caps">Available Now</span>
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 400,
                  color: "var(--foreground)",
                  lineHeight: 1.2,
                }}
              >
                Meet Our Newest Friends
              </h2>
            </div>
            <Link
              to="/pets"
              className="flex items-center gap-2 transition-colors duration-200"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              View All Pets →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPets.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 1px 2px rgba(26,26,26,0.04)",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 16px rgba(26,26,26,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 1px 2px rgba(26,26,26,0.04)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)";
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    height: "2px",
                    background: "var(--accent)",
                    opacity: 0.7,
                  }}
                />
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={
                      pet.image_url ||
                      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"
                    }
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded"
                    style={{
                      background: "rgba(250,250,248,0.9)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span className="label-caps" style={{ fontSize: "0.6rem" }}>
                      {pet.species}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "1.25rem",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {pet.name}
                  </h3>
                  <p
                    className="mb-4"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {pet.breed} · {pet.age} yrs
                  </p>
                  <Link
                    to="/pets"
                    className="block w-full text-center py-3 rounded text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                    style={{
                      border: "1px solid var(--foreground)",
                      color: "var(--foreground)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--accent)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--accent)";
                      (e.currentTarget as HTMLElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--foreground)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--foreground)";
                    }}
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Features Section */}
      <section style={{ padding: "6rem 0", background: "var(--muted)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span
                style={{
                  flex: 1,
                  maxWidth: "60px",
                  height: "1px",
                  background: "var(--border)",
                }}
              />
              <span className="label-caps">The Paws Ecosystem</span>
              <span
                style={{
                  flex: 1,
                  maxWidth: "60px",
                  height: "1px",
                  background: "var(--border)",
                }}
              />
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              Everything Your Pet Needs,
              <br />
              <em style={{ color: "var(--accent)" }}>In One Place</em>
            </h2>
            <p
              style={{
                color: "var(--muted-foreground)",
                maxWidth: "440px",
                margin: "0 auto",
                lineHeight: 1.8,
              }}
            >
              We've built a complete ecosystem to ensure your pet's happiness
              from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Pet Adoption",
                desc: "Browse hundreds of pets waiting for their forever home. Submit your own pets for adoption too.",
              },
              {
                icon: Package,
                title: "Premium Shop",
                desc: "Premium food, toys, and accessories delivered to your doorstep with secure Razorpay payments.",
              },
              {
                icon: Stethoscope,
                title: "Health Care",
                desc: "Track vaccinations and medical records with automated reminders from our dedicated staff.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="p-8"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 1px 4px rgba(26,26,26,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center rounded mb-6"
                  style={{
                    background: "rgba(184,134,11,0.08)",
                    border: "1px solid rgba(184,134,11,0.15)",
                  }}
                >
                  <feature.icon
                    className="h-4 w-4"
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.2rem",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--muted-foreground)",
                    lineHeight: 1.75,
                    fontSize: "0.95rem",
                  }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Delivery Section */}
      <section style={{ padding: "6rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/033/228/289/small/close-up-hands-giving-a-packing-delivery-cardboard-box-ai-generated-photo.jpg"
                  alt="Delivery"
                  className="w-full object-cover rounded-lg"
                  style={{
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 32px rgba(26,26,26,0.08)",
                    height: "380px",
                  }}
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute -bottom-4 -right-4 px-6 py-4 rounded"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Free
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      opacity: 0.85,
                    }}
                  >
                    Shipping
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span
                  style={{
                    height: "1px",
                    width: "40px",
                    background: "var(--border)",
                  }}
                />
                <span className="label-caps">Delivery & Payments</span>
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                  fontWeight: 400,
                  color: "var(--foreground)",
                  lineHeight: 1.2,
                  marginBottom: "1.25rem",
                }}
              >
                Delivered to
                <br />
                <em style={{ color: "var(--accent)" }}>Your Doorstep</em>
              </h2>
              <p
                style={{
                  color: "var(--muted-foreground)",
                  lineHeight: 1.8,
                  marginBottom: "1.5rem",
                }}
              >
                We've partnered with India's best logistics providers to ensure
                your pet supplies reach you safely and quickly.
              </p>
              <p
                style={{
                  color: "var(--foreground)",
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  marginBottom: "2rem",
                  padding: "1rem",
                  borderLeft: "2px solid var(--accent)",
                  background: "rgba(184,134,11,0.04)",
                }}
              >
                A valid delivery address and phone number are required in your
                profile for all orders.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Real-time Tracking",
                    desc: "Monitor your order from warehouse to home.",
                  },
                  {
                    title: "Secure Payments",
                    desc: "Multiple options including Razorpay and UPI.",
                  },
                  {
                    title: "Quality Guaranteed",
                    desc: "Every product checked before dispatch.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle
                      className="h-4 w-4 mt-1 flex-shrink-0"
                      style={{ color: "var(--accent)" }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--foreground)",
                          fontSize: "0.95rem",
                          marginBottom: "0.1rem",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          color: "var(--muted-foreground)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* CTA Section */}
      <section style={{ padding: "6rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div
            className="text-center p-16 rounded-lg relative overflow-hidden"
            style={{ background: "var(--foreground)" }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "400px",
                height: "400px",
                background:
                  "radial-gradient(circle, rgba(184,134,11,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div className="relative z-10">
              <span
                className="label-caps"
                style={{
                  color: "rgba(212,168,75,0.8)",
                  display: "block",
                  marginBottom: "1.5rem",
                }}
              >
                Start Your Journey
              </span>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                  fontWeight: 400,
                  color: "white",
                  lineHeight: 1.15,
                  marginBottom: "1.25rem",
                }}
              >
                Ready to Find Your
                <br />
                <em style={{ color: "var(--accent-secondary)" }}>
                  Perfect Companion?
                </em>
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "2.5rem",
                  maxWidth: "400px",
                  margin: "0 auto 2.5rem",
                  lineHeight: 1.8,
                }}
              >
                Join our community of 10,000+ pet lovers and change a life
                today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-10 py-4 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    fontSize: "0.95rem",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--accent-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--accent)")
                  }
                >
                  Create Account
                </Link>
                <Link
                  to="/pets"
                  className="inline-flex items-center justify-center px-10 py-4 rounded font-medium transition-all duration-200 min-h-[44px]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                    fontSize: "0.95rem",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--accent-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.25)";
                    (e.currentTarget as HTMLElement).style.color = "white";
                  }}
                >
                  Browse Pets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid var(--border)", padding: "2rem 0" }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1rem",
                color: "var(--foreground)",
              }}
            >
              Paws
            </span>
          </div>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
            }}
          >
            © {new Date().getFullYear()} Paws — Pet Adoption & E-Commerce
          </p>
        </div>
      </footer>
    </div>
  );
};

// --- LOGIN PAGE ---
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.auth.login({ email, password });
      login(res.token, res.user);
      toast.success("Welcome back.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span
              style={{ flex: 1, height: "1px", background: "var(--border)" }}
            />
            <span className="label-caps">Welcome Back</span>
            <span
              style={{ flex: 1, height: "1px", background: "var(--border)" }}
            />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "2.25rem",
              fontWeight: 400,
              color: "var(--foreground)",
            }}
          >
            Sign In
          </h1>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "2.5rem",
            boxShadow: "0 4px 16px rgba(26,26,26,0.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              {
                label: "Email Address",
                type: "email",
                value: email,
                setter: setEmail,
                placeholder: "admin@paws.com",
              },
              {
                label: "Password",
                type: "password",
                value: password,
                setter: setPassword,
                placeholder: "••••••••",
              },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  required
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full outline-none transition-all duration-150"
                  style={{
                    height: "44px",
                    padding: "0 1rem",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    background: "transparent",
                    color: "var(--foreground)",
                    fontSize: "0.95rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px rgba(184,134,11,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
              style={{
                background: "var(--accent)",
                color: "white",
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-secondary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              Sign In
            </button>
          </form>
          <div
            style={{
              height: "1px",
              background: "var(--border)",
              margin: "1.5rem 0",
            }}
          />
          <p
            className="text-center"
            style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "var(--accent)", textDecoration: "none" }}
              className="transition-opacity hover:opacity-70"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- SIGNUP PAGE ---
const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.auth.signup({ email, password, name });
      toast.success("Account created. Please sign in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span
              style={{ flex: 1, height: "1px", background: "var(--border)" }}
            />
            <span className="label-caps">Join Paws</span>
            <span
              style={{ flex: 1, height: "1px", background: "var(--border)" }}
            />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "2.25rem",
              fontWeight: 400,
              color: "var(--foreground)",
            }}
          >
            Create Account
          </h1>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "2.5rem",
            boxShadow: "0 4px 16px rgba(26,26,26,0.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              {
                label: "Full Name",
                type: "text",
                value: name,
                setter: setName,
                placeholder: "Your full name",
              },
              {
                label: "Email Address",
                type: "email",
                value: email,
                setter: setEmail,
                placeholder: "you@example.com",
              },
              {
                label: "Password",
                type: "password",
                value: password,
                setter: setPassword,
                placeholder: "••••••••",
              },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  required
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full outline-none transition-all duration-150"
                  style={{
                    height: "44px",
                    padding: "0 1rem",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    background: "transparent",
                    color: "var(--foreground)",
                    fontSize: "0.95rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px rgba(184,134,11,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-3 rounded font-medium transition-all duration-200 min-h-[44px]"
              style={{
                background: "var(--accent)",
                color: "white",
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-secondary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              Create Account
            </button>
          </form>
          <div
            style={{
              height: "1px",
              background: "var(--border)",
              margin: "1.5rem 0",
            }}
          />
          <p
            className="text-center"
            style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent)", textDecoration: "none" }}
              className="transition-opacity hover:opacity-70"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

import Pets from "./pages/Pets";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";

// --- PROTECTED ROUTE ---
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  roles?: Role[];
}> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        className="p-20 text-center"
        style={{
          color: "var(--muted-foreground)",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

// --- NOTIFICATIONS PAGE ---
const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user)
      api.notifications
        .get()
        .then(setNotifications)
        .finally(() => setLoading(false));
  }, [user]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (!unread.length) return;
    try {
      await Promise.all(unread.map((n) => api.notifications.markRead(n.id)));
      setNotifications(notifications.map((n) => ({ ...n, is_read: 1 })));
      toast.success("All marked as read.");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  if (loading)
    return (
      <div
        className="p-20 text-center"
        style={{
          color: "var(--muted-foreground)",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Loading notifications...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <span
              style={{
                height: "1px",
                width: "32px",
                background: "var(--border)",
              }}
            />
            <span className="label-caps">Inbox</span>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "2.5rem",
              fontWeight: 400,
              color: "var(--foreground)",
            }}
          >
            Notifications
          </h1>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 transition-colors duration-200"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            <CheckCircle className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div
            className="p-12 text-center rounded-lg"
            style={{
              border: "1px dashed var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.1rem",
                fontStyle: "italic",
              }}
            >
              No notifications yet.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between p-5 rounded-lg"
              style={{
                background: n.is_read ? "var(--card)" : "rgba(184,134,11,0.04)",
                border: `1px solid ${
                  n.is_read ? "var(--border)" : "rgba(184,134,11,0.2)"
                }`,
              }}
            >
              <div>
                <p
                  style={{
                    color: n.is_read
                      ? "var(--muted-foreground)"
                      : "var(--foreground)",
                    fontSize: "0.95rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  {n.message}
                </p>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.6rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="ml-4 flex-shrink-0 transition-colors duration-200"
                  style={{ color: "var(--accent)" }}
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div
          className="min-h-screen"
          style={{
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/shop" element={<Shop />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute roles={["staff"]}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <div
                    className="p-20 text-center"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.5rem",
                      color: "var(--muted-foreground)",
                      fontStyle: "italic",
                    }}
                  >
                    Page under construction.
                  </div>
                }
              />
            </Routes>
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: "0.9rem",
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}
