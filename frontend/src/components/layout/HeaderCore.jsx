import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Heart, ShoppingCart, User, Phone, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useCart } from "../../contexts/CartContext";
import CartDrawer from "../cart/CartDrawer";
import SearchInput from "../SearchInput";

/**
 * HeaderCore - Clean retail header with B14 Search
 * RETAIL LAYOUT CORE v2
 */
export default function HeaderCore() {
  const { isAuthenticated } = useAuth();
  const { favorites } = useFavorites();
  const { cart } = useCart();

  const [showMega, setShowMega] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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

          {/* Search - Desktop */}
          <div className="ys-header-search hide-on-mobile">
            <SearchInput />
          </div>

          {/* Mobile Search Button */}
          <button 
            className="ys-header-icon show-on-mobile"
            onClick={() => setShowMobileSearch(true)}
            data-testid="mobile-search-btn"
            aria-label="Search"
          >
            <Search size={22} />
          </button>

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

      {/* Mobile Full-Screen Search */}
      {showMobileSearch && (
        <div className="ys-mobile-search-overlay" data-testid="mobile-search-overlay">
          <SearchInput 
            isMobileFullScreen 
            autoFocus 
            onClose={() => setShowMobileSearch(false)} 
          />
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}
