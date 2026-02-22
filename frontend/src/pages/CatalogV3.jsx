import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/products";
import { parseFiltersFromSearch, buildSearchFromFilters } from "../utils/urlFilters";
import ActiveFilterChips from "../components/catalog/ActiveFilterChips";
import Pagination from "../components/catalog/Pagination";
import ProductSkeletonGrid from "../components/catalog/ProductSkeletonGrid";
import FiltersSidebar from "../components/catalog/FiltersSidebar";
import ProductCardCompact from "../components/ProductCardCompact";
import { useLanguage } from "../contexts/LanguageContext";

export default function CatalogV3() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // 1) init from URL
  const init = useMemo(() => parseFiltersFromSearch(location.search), [location.search]);

  const [filters, setFilters] = useState(init.filters);
  const [page, setPage] = useState(init.page);

  // 2) sync with URL changes
  useEffect(() => {
    const next = parseFiltersFromSearch(location.search);
    setFilters(next.filters);
    setPage(next.page);
  }, [location.search]);

  // 3) data state
  const [data, setData] = useState({ meta: { page: 1, pages: 1, total: 0 }, items: [] });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 4) fetch on filter/page change
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    fetchProducts(filters, page, 24)
      .then((d) => {
        if (!alive) return;
        // Handle different response formats
        const items = d.products || d.items || [];
        const total = d.total || items.length;
        const pages = d.pages || Math.ceil(total / 24);
        setData({
          items,
          meta: { page, pages, total }
        });
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.message || "Error");
      })
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [filters, page]);

  // 5) push state to URL
  const pushToUrl = (nextFilters, nextPage) => {
    const search = buildSearchFromFilters(nextFilters, nextPage);
    navigate({ pathname: location.pathname, search }, { replace: false });
  };

  const onFiltersChange = (nextFilters) => {
    pushToUrl(nextFilters, 1); // reset page on filter change
    setDrawerOpen(false);
  };

  const onClearAll = () => {
    pushToUrl({
      q: "",
      brands: [],
      priceMin: null,
      priceMax: null,
      inStock: false,
      rating: null,
      category: filters.category, // keep category
      sort: "pop",
    }, 1);
  };

  const products = data.items || [];
  const pages = data.meta?.pages || 1;
  const total = data.meta?.total || 0;

  const texts = {
    ua: {
      catalog: "Каталог",
      found: "товарів",
      filters: "Фільтри",
      empty: "Нічого не знайдено",
      error: "Помилка",
      loading: "Завантаження..."
    },
    ru: {
      catalog: "Каталог",
      found: "товаров",
      filters: "Фильтры",
      empty: "Ничего не найдено",
      error: "Ошибка",
      loading: "Загрузка..."
    }
  };
  const txt = texts[language] || texts.ua;

  return (
    <div className="ys-page">
      <section className="ys-section">
        <div className="ys-container">
          <div className="ys-catalog" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
            {/* SIDEBAR (desktop) */}
            <aside className="ys-catalog-sidebar ys-desktop-only">
              <div className="ys-card ys-filters">
                <FiltersSidebar
                  value={filters}
                  onApply={onFiltersChange}
                  onReset={onClearAll}
                />
              </div>
            </aside>

            {/* MAIN */}
            <main className="ys-catalog-main">
              <div className="ys-catalog-toolbar">
                <div>
                  <h1 className="ys-catalog-title">{txt.catalog}</h1>
                  <p className="ys-catalog-subtitle">{total} {txt.found}</p>
                </div>

                {/* Mobile filters button */}
                <button 
                  className="ys-btn ys-btn-primary ys-mobile-only" 
                  onClick={() => setDrawerOpen(true)}
                >
                  {txt.filters}
                </button>

                {/* Sort */}
                <select
                  className="ys-select"
                  value={filters.sort || "pop"}
                  onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
                  style={{ width: 'auto', minWidth: '140px' }}
                  data-testid="catalog-sort-dropdown"
                >
                  <option value="pop">Популярні</option>
                  <option value="new">Новинки</option>
                  <option value="price_asc">Ціна ↑</option>
                  <option value="price_desc">Ціна ↓</option>
                  <option value="rating_desc">Рейтинг</option>
                </select>
              </div>

              {/* Active chips */}
              <ActiveFilterChips 
                filters={filters} 
                onChange={onFiltersChange} 
                onClearAll={onClearAll} 
              />

              {/* Products */}
              {loading ? (
                <ProductSkeletonGrid count={12} />
              ) : err ? (
                <div className="ys-card ys-empty">{txt.error}: {err}</div>
              ) : products.length === 0 ? (
                <div className="ys-card ys-empty">{txt.empty}</div>
              ) : (
                <>
                  <div className="ys-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                    {products.map((p) => (
                      <ProductCardCompact key={p.id || p._id} product={p} />
                    ))}
                  </div>

                  <Pagination
                    page={page}
                    pages={pages}
                    onPage={(p) => pushToUrl(filters, p)}
                  />
                </>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Mobile filters drawer */}
      {drawerOpen && (
        <div className="ys-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="ys-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <strong style={{ fontSize: 18 }}>{txt.filters}</strong>
              <button className="ys-btn ys-btn-secondary" onClick={() => setDrawerOpen(false)}>
                ✕
              </button>
            </div>
            <FiltersSidebar
              value={filters}
              onApply={onFiltersChange}
              onReset={onClearAll}
            />
          </div>
        </div>
      )}
    </div>
  );
}
