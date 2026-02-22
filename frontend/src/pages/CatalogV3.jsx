/**
 * CatalogV3 - Layout Core v2: Sidebar Grid + URL state + Filters
 */
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
import SEO from "../components/SEO";

export default function CatalogV3() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();

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

  // Available brands for filters (could come from API)
  const availableBrands = ["Apple", "Samsung", "Xiaomi", "Sony", "LG", "Lenovo", "HP", "Asus", "Acer", "Philips"];

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

  const onFiltersApply = (nextFilters) => {
    pushToUrl(nextFilters, 1); // reset page on filter change
    setDrawerOpen(false);
  };

  const onFiltersChange = (nextFilters) => {
    pushToUrl(nextFilters, 1);
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

  const texts = language === "uk" ? {
    catalog: "Каталог",
    found: "товарів",
    filters: "Фільтри",
    empty: "Нічого не знайдено",
    error: "Помилка",
    loading: "Завантаження...",
    sort: "Сортування",
    popular: "Популярні",
    new: "Новинки",
    priceAsc: "Ціна ↑",
    priceDesc: "Ціна ↓",
    close: "Закрити"
  } : {
    catalog: "Каталог",
    found: "товаров",
    filters: "Фильтры",
    empty: "Ничего не найдено",
    error: "Ошибка",
    loading: "Загрузка...",
    sort: "Сортировка",
    popular: "Популярные",
    new: "Новинки",
    priceAsc: "Цена ↑",
    priceDesc: "Цена ↓",
    close: "Закрыть"
  };

  return (
    <>
      <SEO 
        title={`${texts.catalog} - Y-Store`}
        description="Каталог товарів Y-Store. Смартфони, ноутбуки, електроніка за найкращими цінами."
      />
      
      <div className="ys-page">
        <section className="ys-section">
          <div className="ys-container">
            <div className="ys-catalog">
              {/* SIDEBAR (desktop) */}
              <aside className="ys-catalog-sidebar ys-desktop-only">
                <FiltersSidebar
                  value={filters}
                  onApply={onFiltersApply}
                  onReset={onClearAll}
                  brands={availableBrands}
                />
              </aside>

              {/* MAIN */}
              <main className="ys-catalog-main">
                {/* Toolbar */}
                <div className="ys-catalog-toolbar">
                  <div>
                    <h1 className="ys-catalog-title">{texts.catalog}</h1>
                    <p className="ys-catalog-subtitle">
                      {total} {texts.found}
                    </p>
                  </div>

                  {/* Mobile filters button */}
                  <button
                    className="ys-btn ys-btn-primary ys-mobile-only"
                    onClick={() => setDrawerOpen(true)}
                    style={{ height: 40, borderRadius: 12, padding: "0 16px" }}
                  >
                    {texts.filters}
                  </button>

                  {/* Sort select */}
                  <select
                    className="ys-select"
                    value={filters.sort || "pop"}
                    onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
                    style={{ width: "auto", minWidth: 150 }}
                  >
                    <option value="pop">{texts.popular}</option>
                    <option value="new">{texts.new}</option>
                    <option value="price_asc">{texts.priceAsc}</option>
                    <option value="price_desc">{texts.priceDesc}</option>
                  </select>
                </div>

                {/* Active filter chips */}
                <ActiveFilterChips 
                  filters={filters} 
                  onChange={onFiltersChange} 
                  onClearAll={onClearAll} 
                />

                {/* Products */}
                {loading ? (
                  <ProductSkeletonGrid count={12} />
                ) : err ? (
                  <div className="ys-card ys-empty" style={{ padding: 40, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}>
                    {texts.error}: {err}
                  </div>
                ) : products.length === 0 ? (
                  <div className="ys-card ys-empty" style={{ padding: 40, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}>
                    {texts.empty}
                  </div>
                ) : (
                  <div className="ys-products-grid">
                    {products.map((p) => (
                      <ProductCardCompact key={p.id} product={p} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <Pagination
                  page={data.meta?.page || page}
                  pages={data.meta?.pages || 1}
                  onPage={(p) => pushToUrl(filters, p)}
                />
              </main>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile filters drawer */}
      {drawerOpen && (
        <div className="ys-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="ys-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <strong style={{ fontSize: 18 }}>{texts.filters}</strong>
              <button 
                className="ys-btn ys-btn-ghost" 
                onClick={() => setDrawerOpen(false)}
                style={{ height: 36, borderRadius: 10, padding: "0 12px" }}
              >
                {texts.close}
              </button>
            </div>
            <FiltersSidebar
              value={filters}
              onApply={onFiltersApply}
              onReset={onClearAll}
              brands={availableBrands}
            />
          </div>
        </div>
      )}
    </>
  );
}
