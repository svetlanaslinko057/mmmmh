/**
 * SearchInput Component - Live suggest dropdown with keyboard navigation
 * BLOCK S2.1 - Search with <300ms response
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, TrendingUp, Package } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Recent searches storage
const RECENT_KEY = "ys_recent_search_v1";
function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, 6) : [];
  } catch {
    return [];
  }
}
function saveRecent(q) {
  const v = q.trim();
  if (!v) return;
  const arr = loadRecent();
  const next = [v, ...arr.filter((x) => x !== v)].slice(0, 6);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

// Highlight matching text
function Highlight({ text, query }) {
  if (!query || query.length < 2) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-800 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchInput({ className = "", onClose }) {
  const [q, setQ] = useState("");
  const [suggest, setSuggest] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const abortRef = useRef(null);

  // Build flat items list for keyboard nav
  const items = useMemo(() => {
    const out = [];
    
    if (suggest?.products?.length) {
      out.push({ type: "title", label: "Товари" });
      suggest.products.forEach((p) => out.push({ type: "product", data: p }));
    }
    
    if (suggest?.categories?.length) {
      out.push({ type: "title", label: "Категорії" });
      suggest.categories.forEach((c) => out.push({ type: "category", data: c }));
    }
    
    if (!q.trim()) {
      const recent = loadRecent();
      if (recent.length) {
        out.push({ type: "title", label: "Нещодавні" });
        recent.forEach((r) => out.push({ type: "recent", data: r }));
      }
      
      if (suggest?.popular?.length) {
        out.push({ type: "title", label: "Популярне" });
        suggest.popular.forEach((p) => out.push({ type: "popular", data: p }));
      }
    }
    
    return out;
  }, [suggest, q]);

  // Fetch suggestions
  const fetchSuggest = useCallback(async (query) => {
    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const url = query.length >= 2
        ? `${API_URL}/api/v2/search/suggest?q=${encodeURIComponent(query)}`
        : `${API_URL}/api/v2/search/suggest?q=`;
      
      const r = await fetch(url, { signal: ac.signal });
      const data = await r.json();
      setSuggest(data);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setSuggest({ products: [], categories: [], popular: [] });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        fetchSuggest(q);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [q, isOpen, fetchSuggest]);

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

  function goSearch(query) {
    const v = query.trim();
    if (!v) return;
    saveRecent(v);
    setIsOpen(false);
    setQ("");
    navigate(`/search?q=${encodeURIComponent(v)}`);
    onClose?.();
  }

  function handleKeyDown(e) {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      let i = activeIdx + 1;
      while (i < items.length && items[i].type === "title") i++;
      if (i >= items.length) i = -1;
      setActiveIdx(i);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      let i = activeIdx - 1;
      while (i >= 0 && items[i]?.type === "title") i--;
      setActiveIdx(i);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        const it = items[activeIdx];
        if (it.type === "product") {
          saveRecent(q);
          setIsOpen(false);
          navigate(`/product/${it.data.slug || it.data.id}`);
          onClose?.();
        } else if (it.type === "category") {
          setIsOpen(false);
          navigate(`/catalog?category=${it.data.slug}`);
          onClose?.();
        } else if (it.type === "popular" || it.type === "recent") {
          goSearch(it.data);
        }
      } else if (q.trim()) {
        goSearch(q);
      }
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function handleProductClick(product) {
    saveRecent(q);
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

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActiveIdx(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            setActiveIdx(-1);
            fetchSuggest("");
          }}
          placeholder="Пошук товарів..."
          className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-5 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          data-testid="search-input"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
          data-testid="search-dropdown"
        >
          {/* Products */}
          {suggest?.products?.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Package className="w-4 h-4" />
                <span>Товари</span>
              </div>
              <div className="space-y-1">
                {suggest.products.map((p, idx) => {
                  const itemIdx = items.findIndex(i => i.type === "product" && i.data === p);
                  const isActive = itemIdx === activeIdx;
                  return (
                    <div
                      key={p._id || p.id}
                      onClick={() => handleProductClick(p)}
                      onMouseEnter={() => setActiveIdx(itemIdx)}
                      className={`cursor-pointer flex items-center justify-between py-2 px-3 rounded-xl transition ${
                        isActive ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img 
                            src={p.images[0]} 
                            alt={p.title || p.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                          />
                        )}
                        <span className="font-medium">
                          <Highlight text={p.title || p.name || ""} query={q} />
                        </span>
                      </div>
                      <span className="font-bold text-blue-600">{p.price} грн</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories */}
          {suggest?.categories?.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>Категорії</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggest.categories.map((c) => {
                  const itemIdx = items.findIndex(i => i.type === "category" && i.data === c);
                  const isActive = itemIdx === activeIdx;
                  return (
                    <button
                      key={c._id || c.slug}
                      onClick={() => handleCategoryClick(c)}
                      onMouseEnter={() => setActiveIdx(itemIdx)}
                      className={`px-4 py-2 rounded-full text-sm transition ${
                        isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                    >
                      <Highlight text={c.title || c.name || ""} query={q} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent searches (when no query) */}
          {!q.trim() && loadRecent().length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Clock className="w-4 h-4" />
                <span>Нещодавні пошуки</span>
              </div>
              <div className="space-y-1">
                {loadRecent().map((r, i) => {
                  const itemIdx = items.findIndex(it => it.type === "recent" && it.data === r);
                  const isActive = itemIdx === activeIdx;
                  return (
                    <div
                      key={i}
                      onClick={() => goSearch(r)}
                      onMouseEnter={() => setActiveIdx(itemIdx)}
                      className={`cursor-pointer py-2 px-3 rounded-lg transition flex items-center gap-2 ${
                        isActive ? "bg-gray-100 text-blue-600" : "hover:bg-gray-50 text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      {r}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Queries */}
          {suggest?.popular?.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>Популярні запити</span>
              </div>
              <div className="space-y-1">
                {suggest.popular.map((p, i) => {
                  const itemIdx = items.findIndex(it => it.type === "popular" && it.data === p);
                  const isActive = itemIdx === activeIdx;
                  return (
                    <div
                      key={i}
                      onClick={() => goSearch(p)}
                      onMouseEnter={() => setActiveIdx(itemIdx)}
                      className={`cursor-pointer py-2 px-3 rounded-lg transition ${
                        isActive ? "bg-gray-100 text-blue-600" : "hover:bg-gray-50 text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {p}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && q.length >= 2 && 
           !suggest?.products?.length && 
           !suggest?.categories?.length && (
            <div className="p-6 text-center text-gray-500">
              Нічого не знайдено за запитом "{q}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
