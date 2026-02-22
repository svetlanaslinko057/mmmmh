# Y-Store Marketplace - PRD V4.0

## RETAIL LAYOUT CORE v1 - Завершено ✅

### Что создано
**Новый чистый фундамент** - изолированная система layout без старого мусора.

### Файлы
- `/frontend/src/styles/layout-core.css` - единый источник layout (~1600 строк)
- `/frontend/src/components/layout/HeaderCore.jsx` - чистый Header
- Все старые layout классы заменены на `ys-*`

### CSS Архитектура

```
layout-core.css
├── RESET (box-sizing, margins)
├── CONTAINER (.ys-container max-width: 1280px)
├── SECTION (.ys-section padding: 40px 0)
├── HEADER (.ys-header fixed, top: 0)
│   ├── .ys-header-top (72px)
│   ├── .ys-header-bottom (52px)
│   ├── .ys-header-search
│   └── .ys-header-icons
├── GRID (.ys-grid-4, .ys-grid-3, .ys-grid-2, .ys-grid-6)
├── CARD (.ys-card with .ys-card-footer: margin-top: auto)
├── BUTTON (.ys-btn, .ys-btn-primary, .ys-btn-success)
├── HERO (.ys-hero)
├── CATEGORIES (.ys-categories-grid)
├── ADVANTAGES (.ys-advantages, .ys-advantages-grid)
├── DEAL OF DAY (.ys-deal)
├── TESTIMONIALS (.ys-testimonials-grid)
├── CART DRAWER (.ys-drawer)
├── NEWSLETTER (.ys-newsletter)
├── CATALOG (.ys-catalog with sidebar grid)
└── FOOTER (.ys-footer)
```

---

## CatalogV3 - Завершено ✅ (22.02.2026)

### Что реализовано

#### Backend API (P0 - Готово)
- `/api/v2/catalog` - список товаров с фильтрами, сортировкой, пагинацией
- `/api/v2/catalog/filters` - доступные фильтры (бренды, цены)
- `/api/v2/catalog/facets` - категории, бренды, ценовой диапазон
- `/api/v2/search/suggest` - поисковые подсказки

#### Frontend Components (P0 - Готово)
- `CatalogV3.jsx` - главная страница каталога с grid layout
- `FiltersSidebar.jsx` - боковая панель фильтров (цена, бренд, наличие, рейтинг, сортировка)
- `ActiveFilterChips.jsx` - чипсы активных фильтров
- `Pagination.jsx` - пагинация с умным отображением страниц
- `ProductSkeletonGrid.jsx` - скелетоны загрузки

#### API Integration
- `products.js` - fetchProducts, fetchFacets, fetchSuggest
- `urlFilters.js` - parseFiltersFromSearch, buildSearchFromFilters

### Тестирование
- ✅ Backend: 100% успех (pytest)
- ✅ Frontend: 95% успех (Playwright)
- ✅ API endpoints работают корректно
- ✅ Фильтрация по цене, сортировка, пагинация

### Известные ограничения
- Товары в базе не имеют поля `brand` - фильтрация по бренду вернёт 0 результатов
- Всего 4 товара в базе для тестирования

---

## Интеграции

| Сервис | Статус |
|--------|--------|
| Telegram Bot | ✅ |
| Nova Poshta | ✅ |
| Fondy | ✅ |
| MongoDB | ✅ |

## Credentials
- Test User: test@ystore.com / Test123!
- Backend: http://localhost:8001
- Frontend: http://localhost:3000

---

## Backlog

### P1 - Следующие задачи
- [ ] MegaMenu для категорий в HeaderCore
- [ ] Поисковая строка с live suggestions
- [ ] Страница товара ProductPageV4

### P2 - Улучшения
- [ ] Добавить бренды к товарам в базе
- [ ] SEO оптимизация каталога
- [ ] Responsive улучшения для мобильных
- [ ] Cart V3 upsells

### Known Issues
- Tailwind CSS перезаписывает ys-* стили - используются inline styles для критичных layout
