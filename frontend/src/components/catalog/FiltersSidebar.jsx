/**
 * FiltersSidebar V2 - Foxtrot-style with Apply/Reset + Collapses
 */
import React, { useEffect, useMemo, useState } from "react";

function clampNum(x, min, max) {
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function Section({ title, open, onToggle, children }) {
  return (
    <div className="ys-filter-sec">
      <button type="button" className="ys-filter-sec__head" onClick={onToggle}>
        <span>{title}</span>
        <span className={`ys-filter-sec__chev ${open ? "is-open" : ""}`}>⌄</span>
      </button>
      {open && <div className="ys-filter-sec__body">{children}</div>}
    </div>
  );
}

export default function FiltersSidebar({ value, onApply, onReset, brands = [] }) {
  // draft state (черновик)
  const [draft, setDraft] = useState(value || {});
  const [priceMin, setPriceMin] = useState(value?.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(value?.priceMax ?? "");

  // sync draft when URL/value changed externally
  useEffect(() => {
    setDraft(value || {});
    setPriceMin(value?.priceMin ?? "");
    setPriceMax(value?.priceMax ?? "");
  }, [value]);

  // accordion state (persist in localStorage)
  const [open, setOpen] = useState(() => {
    try {
      const raw = localStorage.getItem("ys_filters_open_v1");
      return raw
        ? JSON.parse(raw)
        : { price: true, brand: true, stock: true, rating: false, sort: false };
    } catch {
      return { price: true, brand: true, stock: true, rating: false, sort: false };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ys_filters_open_v1", JSON.stringify(open));
    } catch {}
  }, [open]);

  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  // dirty flag
  const dirty = useMemo(() => {
    const draftWithPrice = {
      ...draft,
      priceMin: priceMin === "" ? null : Number(priceMin),
      priceMax: priceMax === "" ? null : Number(priceMax),
    };
    return JSON.stringify(draftWithPrice) !== JSON.stringify(value);
  }, [draft, priceMin, priceMax, value]);

  // бренды из props или дефолтные
  const BRANDS = brands.length > 0 ? brands : [
    "Apple", "Samsung", "Xiaomi", "Lenovo", "HP", "Sony", "LG", "Asus", "Acer", "Philips"
  ];

  const setBrand = (b, checked) => {
    const prev = draft?.brands || [];
    const next = checked ? Array.from(new Set([...prev, b])) : prev.filter((x) => x !== b);
    setDraft({ ...draft, brands: next });
  };

  const apply = () => {
    const finalFilters = {
      ...draft,
      priceMin: priceMin === "" ? null : clampNum(priceMin, 0, 999999),
      priceMax: priceMax === "" ? null : clampNum(priceMax, 0, 999999),
    };
    onApply?.(finalFilters);
  };

  const reset = () => {
    setPriceMin("");
    setPriceMax("");
    setDraft({
      q: "",
      brands: [],
      inStock: false,
      rating: null,
      priceMin: null,
      priceMax: null,
      sort: "pop",
      category: value?.category || "",
    });
    onReset?.();
  };

  return (
    <div className="ys-filters">
      <div className="ys-filters__top">
        <div className="ys-filters-head">
          <div>
            <div className="ys-filters-title">Фільтри</div>
            <div className="ys-filters-sub">Налаштуйте під себе</div>
          </div>
        </div>

        <div className="ys-filters__actions">
          <button
            type="button"
            className="ys-btn ys-btn-primary"
            disabled={!dirty}
            onClick={apply}
            style={{ height: 40, borderRadius: 12, padding: "0 16px" }}
          >
            Показати
          </button>
          <button 
            type="button" 
            className="ys-btn ys-btn-ghost" 
            onClick={reset}
            style={{ height: 40, borderRadius: 12, padding: "0 16px" }}
          >
            Скинути
          </button>
        </div>
      </div>

      <Section title="Ціна" open={open.price} onToggle={() => toggle("price")}>
        <div className="ys-filter-row">
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 4, display: "block" }}>Від</label>
            <input
              className="ys-input"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="0"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 4, display: "block" }}>До</label>
            <input
              className="ys-input"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="999999"
            />
          </div>
        </div>
        <div className="ys-hint">Вкажіть діапазон та натисніть "Показати"</div>
      </Section>

      <Section title="Бренд" open={open.brand} onToggle={() => toggle("brand")}>
        <div className="ys-brand-list">
          {BRANDS.map((b) => {
            const checked = (draft?.brands || []).includes(b);
            return (
              <label key={b} className="ys-check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setBrand(b, e.target.checked)}
                />
                <span>{b}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Наявність" open={open.stock} onToggle={() => toggle("stock")}>
        <label className="ys-check">
          <input
            type="checkbox"
            checked={!!draft?.inStock}
            onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })}
          />
          <span>Тільки в наявності</span>
        </label>
      </Section>

      <Section title="Рейтинг" open={open.rating} onToggle={() => toggle("rating")}>
        <div className="ys-filter-pills">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              type="button"
              className={`ys-pill ${draft?.rating === r ? "is-active" : ""}`}
              onClick={() => setDraft({ ...draft, rating: draft?.rating === r ? null : r })}
            >
              {r}+ ⭐
            </button>
          ))}
        </div>
      </Section>

      <Section title="Сортування" open={open.sort} onToggle={() => toggle("sort")}>
        <div className="ys-brand-list">
          {[
            { id: "pop", label: "Популярні" },
            { id: "new", label: "Нові" },
            { id: "price_asc", label: "Ціна ↑" },
            { id: "price_desc", label: "Ціна ↓" },
            { id: "rating_desc", label: "Рейтинг" },
          ].map((s) => (
            <label key={s.id} className="ys-radio">
              <input
                type="radio"
                name="sort"
                checked={(draft?.sort || "pop") === s.id}
                onChange={() => setDraft({ ...draft, sort: s.id })}
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Mobile bottom bar */}
      <div className="ys-filters__bottom">
        <button 
          type="button" 
          className="ys-btn ys-btn-primary" 
          disabled={!dirty} 
          onClick={apply}
          style={{ flex: 1, height: 44, borderRadius: 12 }}
        >
          Показати
        </button>
        <button 
          type="button" 
          className="ys-btn ys-btn-ghost" 
          onClick={reset}
          style={{ height: 44, borderRadius: 12, padding: "0 16px" }}
        >
          Скинути
        </button>
      </div>
    </div>
  );
}
