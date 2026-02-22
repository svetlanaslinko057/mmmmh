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
  const [draft, setDraft] = useState(value);

  // sync draft when value changed externally
  useEffect(() => {
    setDraft(value);
  }, [value]);

  // accordion state
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
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(value), [draft, value]);

  // Default brands if not provided
  const BRANDS = brands.length > 0 ? brands : [
    "Apple", "Samsung", "Xiaomi", "Lenovo", "HP", 
    "Sony", "LG", "Asus", "Acer", "Philips"
  ];

  const setBrand = (b, checked) => {
    const prev = draft?.brands || [];
    const next = checked ? Array.from(new Set([...prev, b])) : prev.filter((x) => x !== b);
    setDraft({ ...draft, brands: next });
  };

  const apply = () => {
    onApply?.(draft);
  };

  const reset = () => {
    onReset?.();
  };

  return (
    <div className="ys-filters">
      <div className="ys-filters-head">
        <div>
          <div className="ys-filters-title">Фільтри</div>
          <div className="ys-filters-sub">Налаштуйте під себе</div>
        </div>

        <div className="ys-filters__actions">
          <button
            type="button"
            className="ys-btn ys-btn-primary"
            disabled={!dirty}
            onClick={apply}
          >
            Показати
          </button>
          <button type="button" className="ys-btn ys-btn-secondary" onClick={reset}>
            Скинути
          </button>
        </div>
      </div>

      <Section title="Ціна" open={open.price} onToggle={() => toggle("price")}>
        <div className="ys-filter-grid2">
          <label className="ys-field">
            <span>Від</span>
            <input
              value={draft?.priceMin ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, priceMin: clampNum(e.target.value, 0, 999999) })
              }
              inputMode="numeric"
              placeholder="0"
              className="ys-input"
            />
          </label>

          <label className="ys-field">
            <span>До</span>
            <input
              value={draft?.priceMax ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, priceMax: clampNum(e.target.value, 0, 999999) })
              }
              inputMode="numeric"
              placeholder="999999"
              className="ys-input"
            />
          </label>
        </div>
        <div className="ys-hint">Вкажіть діапазон та натисніть "Показати"</div>
      </Section>

      <Section title="Бренд" open={open.brand} onToggle={() => toggle("brand")}>
        <div className="ys-brand-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {BRANDS.map((b) => {
            const checked = (draft?.brands || []).includes(b);
            return (
              <label key={b} className="ys-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setBrand(b, e.target.checked)}
                  data-testid={`brand-filter-${b.toLowerCase()}`}
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
        <div className="ys-filter-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        <button type="button" className="ys-btn ys-btn-primary ys-btn-full" disabled={!dirty} onClick={apply}>
          Показати
        </button>
        <button type="button" className="ys-btn ys-btn-secondary ys-btn-full" onClick={reset}>
          Скинути
        </button>
      </div>
    </div>
  );
}
