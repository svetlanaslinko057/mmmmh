/**
 * SearchInput Component - Live suggest dropdown
 * BLOCK S2.0
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, TrendingUp, Package } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SearchInput({ className = "", onClose }) {
  const [q, setQ] = useState("");
  const [suggest, setSuggest] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (q.length < 2) {
      setSuggest(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/api/v2/search/suggest?q=${encodeURIComponent(q)}`);
        const data = await r.json();
        setSuggest(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleEnter(e) {
    if (e.key === "Enter" && q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setIsOpen(false);
      onClose?.();
    }
  }

  function handleProductClick(product) {
    navigate(`/product/${product.slug || product.id}`);
    setIsOpen(false);
    setQ("");
    onClose?.();
  }

  function handleCategoryClick(category) {
    navigate(`/catalog?category=${category.slug}`);
    setIsOpen(false);
    setQ("");
    onClose?.();
  }

  function handlePopularClick(query) {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setQ("");
    onClose?.();
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleEnter}
          onFocus={() => suggest && setIsOpen(true)}
          placeholder="Пошук товарів..."
          className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-5 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          data-testid="search-input"
        />
      </div>

      {isOpen && suggest && (
        <div 
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden"
          data-testid="search-dropdown"
        >
          {/* Products */}
          {suggest.products?.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Package className="w-4 h-4" />
                <span>Товари</span>
              </div>
              <div className="space-y-2">
                {suggest.products.map((p) => (
                  <div
                    key={p._id || p.id}
                    onClick={() => handleProductClick(p)}
                    className="cursor-pointer flex items-center justify-between py-2 px-3 hover:bg-blue-50 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && (
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="font-bold text-blue-600">{p.price} грн</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {suggest.categories?.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>Категорії</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggest.categories.map((c) => (
                  <button
                    key={c._id || c.slug}
                    onClick={() => handleCategoryClick(c)}
                    className="px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full text-sm transition"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Queries */}
          {suggest.popular?.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Clock className="w-4 h-4" />
                <span>Популярні запити</span>
              </div>
              <div className="space-y-1">
                {suggest.popular.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => handlePopularClick(p)}
                    className="cursor-pointer py-2 px-3 hover:bg-gray-50 rounded-lg text-gray-700 hover:text-blue-600 transition"
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!suggest.products?.length && !suggest.categories?.length && !suggest.popular?.length && (
            <div className="p-6 text-center text-gray-500">
              Нічого не знайдено за запитом "{q}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
