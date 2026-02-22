# Y-Store Marketplace - PRD v5.0

## Дата обновления: 22.02.2026

---

## Статус проекта: ✅ DEPLOYED & RUNNING

### Ключевые данные
- **Frontend URL**: https://full-stack-setup-18.preview.emergentagent.com
- **Backend URL**: https://full-stack-setup-18.preview.emergentagent.com/api
- **Admin URL**: /admin (требует авторизации)
- **Test Admin**: admin@ystore.com / Admin123!

---

## Архитектура

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py          # Главный FastAPI сервер (~143KB)
├── modules/           # Модули по функционалу
│   ├── auth/          # Авторизация (JWT + Google OAuth)
│   ├── catalog/       # Каталог API v2
│   ├── products/      # Управление товарами
│   ├── orders/        # Заказы + state machine
│   ├── payments/      # Fondy интеграция
│   ├── delivery/      # Nova Poshta интеграция
│   ├── bot/           # Telegram Admin Bot
│   ├── admin/         # Админ API
│   ├── analytics/     # Аналитика + воронки
│   ├── crm/           # CRM система
│   └── ...            # 36+ модулей
├── requirements.txt   # Python зависимости
└── .env              # Конфигурация
```

### Frontend (React 19 + Tailwind)
```
/app/frontend/src/
├── pages/             # Страницы
│   ├── Home.js        # Главная
│   ├── CatalogV3.jsx  # Каталог с фильтрами
│   ├── ProductPageV3.jsx
│   ├── AdminPanel.js  # Админка
│   └── ...
├── components/        # UI компоненты
│   ├── layout/        # HeaderCore, Footer
│   ├── catalog/       # FiltersSidebar, Pagination
│   ├── admin/         # Admin dashboards
│   └── ui/            # Radix UI компоненты
├── contexts/          # React Context (Auth, Cart, etc)
├── styles/            # CSS
│   └── layout-core.css # Retail Layout Core v1
└── utils/             # API, helpers
```

---

## Интеграции

| Сервис | Статус | Credentials |
|--------|--------|-------------|
| MongoDB | ✅ | localhost:27017 / test_database |
| Telegram Bot | ✅ | 8239151803:AAFBBu... |
| Nova Poshta | ✅ | 5cb1e3ebc23e75d737fd57c1e056ecc9 |
| Fondy Payments | ✅ | Merchant ID: 1558123 |

---

## Что реализовано

### ✅ P0 - Core Features
- [x] Frontend + Backend deployed
- [x] MongoDB подключена
- [x] JWT авторизация
- [x] Каталог товаров с фильтрами (CatalogV3)
- [x] Карточки товаров
- [x] Админ-панель с полным функционалом
- [x] 41 категорий + 40 товаров (seeded)

### ✅ Админ-панель включает:
- Аналітика (дашборд)
- Управление пользователями
- Управление товарами
- Управление категориями
- Выплаты
- Замовлення (заказы)
- CRM система
- Слайдер (баннеры)
- Акції (промо)
- Популярні категорії
- Кастомні розділи
- Відгуки (отзывы)
- Повернення (возвраты)
- Політики
- Payment Health
- Risk Center
- Revenue Control
- A/B Tests

---

## Backlog

### 🟡 P1 - Следующие задачи (из вашего Layout Core v2)
- [ ] Layout Core v2 — Catalog Sidebar Grid
- [ ] FiltersSidebar v2 (Apply/Reset + Collapses)
- [ ] URL state для фильтров
- [ ] Products API Filters + Search Suggest
- [ ] Active Filter Chips
- [ ] Pagination + Skeleton loading
- [ ] Search 2.1 (<300ms)

### 🟢 P2 - Улучшения
- [ ] MegaMenu для категорий
- [ ] Mobile responsive улучшения
- [ ] SEO оптимизация (fix Helmet issue)
- [ ] Telegram Bot запуск

---

## Known Issues
- ❌ SEO Helmet компоненты временно отключены (ошибка с title)
- ⚠️ Welcome Modal показывается на каждой странице

---

## Credentials

### Admin User
- Email: admin@ystore.com
- Password: Admin123!
- Role: admin

### API Endpoints
- Health: GET /api/health
- Products: GET /api/products
- Categories: GET /api/categories
- Catalog V2: GET /api/v2/catalog
- Auth: POST /api/auth/login, /api/auth/register

