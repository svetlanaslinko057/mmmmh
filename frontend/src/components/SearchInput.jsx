/**
 * SearchInput Component - B11 Style
 * Live suggestions with products, categories, and popular queries
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { Package, Search, TrendingUp, X } from "lucide-react";

const t = (lang, uk, ru) => (lang === "ru" ? ru : uk);

export default function SearchInput({ className = "" }) {
  const { language } = useLanguage();
  const L = language === "ru" ? "ru" : "uk";
  const nav = useNavigate();
  
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ products: [], categories: [], popular: [] });

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = useMemo(() => q.trim(), [q]);

  const runSearch = (value) => {
    const v = (value || "").trim();
    if (!v) return;
    nav(`/search?q=${encodeURIComponent(v)}`);
    setOpen(false);
    setQ("");
  };

  const goCategory = (slug) => {
    nav(`/catalog?category=${encodeURIComponent(slug)}`);
    setOpen(false);
    setQ("");
  };

  const goProduct = (slug) => {
    nav(`/product/${encodeURIComponent(slug)}`);
    setOpen(false);
    setQ("");
  };

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Debounced fetch
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (trimmed.length < 2) {
      setData({ products: [], categories: [], popular: [] });
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v2/search/suggest?q=${encodeURIComponent(trimmed)}&lang=${L}&limit=8`,
          { signal: ctrl.signal }
        );
        const json = await res.json();

        setData({
          products: json?.products || [],
          categories: json?.categories || [],
          popular: json?.popular || [],
        });
        setOpen(true);
      } catch (e) {
        if (e?.name !== "AbortError") console.error("suggest error", e);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trimmed, L]);

  const hasResults = data.products.length || data.categories.length || data.popular.length;

  return (
    <div ref={boxRef} className={`ys-search-box ${className}`} data-testid="search-input-container">
      <div className="ys-search-input-wrap">
        <Search className="ys-search-icon" size={18} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (trimmed.length >= 2 && hasResults) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
            if (e.key === "Enter") runSearch(trimmed);
          }}
          placeholder={t(L, "Пошук товарів...", "Поиск товаров...")}
          className="ys-search-input"
          data-testid="search-input"
        />
        {q && (
          <button 
            type="button" 
            className="ys-search-clear" 
            onClick={() => { setQ(""); setOpen(false); }}
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && hasResults ? (
        <div className="ys-search-dropdown" data-testid="search-dropdown">
          <div className="ys-search-dropdown-header">
            <span className="ys-search-dropdown-title">
              {loading ? t(L, "Пошук...", "Поиск...") : t(L, "Підказки", "Подсказки")}
            </span>
            <button
              type="button"
              className="ys-btn-sm"
              onClick={() => runSearch(trimmed)}
              data-testid="search-show-all"
            >
              {t(L, "Показати все", "Показать всё")}
            </button>
          </div>

          {/* Categories */}
          {data.categories?.length > 0 && (
            <Section title={t(L, "Категорії", "Категории")}>
              {data.categories.map((c) => (
                <Row key={c.slug} onClick={() => goCategory(c.slug)}>
                  <div className="ys-search-row-icon">
                    <Package size={16} />
                  </div>
                  <span className="ys-search-row-text">{c.name}</span>
                </Row>
              ))}
            </Section>
          )}

          {/* Products */}
          {data.products?.length > 0 && (
            <Section title={t(L, "Товари", "Товары")}>
              {data.products.map((p) => (
                <Row key={p.id || p.slug} onClick={() => goProduct(p.slug || p.id)}>
                  <Thumb src={(p.images || [])[0]} />
                  <div className="ys-search-row-content">
                    <span className="ys-search-row-text">{p.title || p.name}</span>
                    {p.price !== undefined && p.price !== null && (
                      <span className="ys-search-row-price">{p.price} грн</span>
                    )}
                  </div>
                </Row>
              ))}
            </Section>
          )}

          {/* Popular */}
          {data.popular?.length > 0 && (
            <Section title={t(L, "Популярне", "Популярное")}>
              {data.popular.map((s, idx) => (
                <Row key={idx} onClick={() => runSearch(s)}>
                  <div className="ys-search-row-icon">
                    <TrendingUp size={16} />
                  </div>
                  <span className="ys-search-row-text">{s}</span>
                </Row>
              ))}
            </Section>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="ys-search-section">
      <div className="ys-search-section-title">{title}</div>
      <div className="ys-search-section-list">{children}</div>
    </div>
  );
}

function Row({ children, onClick }) {
  return (
    <div className="ys-search-row" onClick={onClick} data-testid="search-suggestion-row">
      {children}
    </div>
  );
}

function Thumb({ src }) {
  return (
    <div className="ys-search-thumb">
      {src ? (
        <img src={src} alt="" />
      ) : (
        <Package size={16} style={{ opacity: 0.4 }} />
      )}
    </div>
  );
}
