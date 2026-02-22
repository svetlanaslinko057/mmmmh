import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, Heart, ShoppingCart, User, Phone, X, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useCart } from "../../contexts/CartContext";
import CartDrawer from "../cart/CartDrawer";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

/**
 * HeaderCore - Clean retail header
 * RETAIL LAYOUT CORE v1
 */
export default function HeaderCore() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { favorites } = useFavorites();
  const { cart } = useCart();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMega, setShowMega] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const searchRef = useRef(null);

  // Live search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          params: { search: query, limit: 5 }
        });
        setSuggestions(res.data?.slice?.(0, 5) || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setQuery("");
    }
  };

  const favoritesCount = favorites?.length || 0;
  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <>
      <header className="ys-header" data-testid="header-core">
        {/* Top Line */}
        <div className="ys-container ys-header-top">
          {/* Logo */}
          <Link to="/" className="ys-header-logo" data-testid="logo">
            Y-Store
          </Link>

          {/* Search */}
          <div className="ys-header-search" ref={searchRef}>
            <form onSubmit={handleSearch} className="ys-header-search-form">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Пошук товарів..."
                className="ys-header-search-input"
                data-testid="search-input"
              />
              <button type="submit" className="ys-header-search-btn" data-testid="search-btn">
                <Search size={20} />
              </button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  zIndex: 200,
                  overflow: 'hidden'
                }}
              >
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => { setShowSuggestions(false); setQuery(""); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {product.images?.[0] && (
                      <img 
                        src={product.images[0]} 
                        alt="" 
                        style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: '#f5f5f5' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.title || product.name}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                        {product.price?.toLocaleString()} ₴
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contacts (desktop) */}
          <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <a href="tel:+380502474161" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#111' }}>
              <Phone size={14} />
              050-247-41-61
            </a>
            <a href="tel:+380637247703" style={{ fontSize: 13, color: '#6b7280' }}>
              063-724-77-03
            </a>
          </div>

          {/* Icons */}
          <div className="ys-header-icons">
            <Link to="/favorites" className="ys-header-icon" data-testid="favorites-btn">
              <Heart size={22} />
              {favoritesCount > 0 && (
                <span className="ys-header-badge">{favoritesCount}</span>
              )}
            </Link>

            <button 
              className="ys-header-icon" 
              onClick={() => setShowCart(true)}
              data-testid="cart-btn"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="ys-header-badge">{cartCount}</span>
              )}
            </button>

            <Link 
              to={isAuthenticated ? "/profile" : "/login"} 
              className="ys-header-icon"
              data-testid="user-btn"
            >
              <User size={22} />
            </Link>
          </div>
        </div>

        {/* Bottom Line - Navigation */}
        <div className="ys-header-bottom">
          <div className="ys-container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <button 
              className="ys-header-catalog-btn"
              onClick={() => setShowMega(!showMega)}
              data-testid="catalog-btn"
            >
              <Menu size={20} />
              Каталог
            </button>

            <nav className="ys-header-nav">
              <Link to="/contacts" className="ys-header-nav-link">Контакти</Link>
              <Link to="/delivery" className="ys-header-nav-link">Доставка і оплата</Link>
              <Link to="/returns" className="ys-header-nav-link">Обмін і повернення</Link>
              <Link to="/about" className="ys-header-nav-link">Про нас</Link>
              <Link to="/promotions" className="ys-header-nav-link promo">Акції</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}
