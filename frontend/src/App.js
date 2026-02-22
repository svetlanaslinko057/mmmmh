import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { CatalogProvider } from './contexts/CatalogContext';
// RETAIL LAYOUT CORE v1: Use clean HeaderCore
import HeaderCore from './components/layout/HeaderCore';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import MultiLevelCatalog from './components/MultiLevelCatalog';
import SupportWidget from './components/SupportWidget';
import WelcomeModal from './components/WelcomeModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import EnhancedProductDetail from './components/product/EnhancedProductDetail';
import ProductPageV3 from './pages/ProductPageV3';
import Favorites from './pages/Favorites';
import Comparison from './pages/Comparison';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutV2 from './pages/CheckoutV2';
import CheckoutV3 from './pages/CheckoutV3';
import CheckoutSuccess from './pages/CheckoutSuccess';
import AuthCallback from './pages/AuthCallback';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';
import ContactInfo from './pages/ContactInfo';
import DeliveryPayment from './pages/DeliveryPayment';
import ExchangeReturn from './pages/ExchangeReturn';
import AboutUs from './pages/AboutUs';
import Terms from './pages/Terms';
import Promotions from './pages/Promotions';
import PromotionDetail from './pages/PromotionDetail';
import OfferDetail from './pages/OfferDetail';
import SectionDetail from './pages/SectionDetail';
import NotFound from './pages/NotFound';
import PickupControlPage from './pages/PickupControlPage';
import PaymentResume from './pages/PaymentResume';
import ScrollToTop from './components/ScrollToTop';
import FloatingActionButton from './components/FloatingActionButton';
import analyticsTracker from './services/analyticsTracker';
// V2 Pages
import Account from './pages/Account';
import AccountOrders from './pages/AccountOrders';
import OrderDetails from './pages/OrderDetails';
import CatalogV3 from './pages/CatalogV3';
// V2-19: Compare Bar
import CompareBar from './components/compare/CompareBar';
// V2-19: Search Results
import SearchResults from './pages/SearchResults';
// V2-19: Compare and Wishlist Pages
import ComparePage from './pages/ComparePage';
import WishlistPage from './pages/WishlistPage';
// B12: Product Page V4
import ProductPageV4 from './pages/ProductPageV4';
import './App.css';

// Analytics Wrapper Component
function AnalyticsWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const pageTitle = document.title;
    analyticsTracker.trackPageView(location.pathname, pageTitle, {
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  return children;
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <NotificationsProvider>
              <ComparisonProvider>
                <FavoritesProvider>
                  <CatalogProvider>
                    <CartProvider>
                      <AnalyticsWrapper>
                        <div data-testid="app" className="App">
                        <Toaster position="top-right" />
                        <WelcomeModal />
                        <MultiLevelCatalog />
                        <HeaderCore />
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/auth-callback" element={<AuthCallback />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/catalog" element={<CatalogV3 />} />
                          <Route path="/product/:id" element={<ProductPageV4 />} />
                          <Route path="/offer/:offerId" element={<OfferDetail />} />
                          <Route path="/favorites" element={<Favorites />} />
                          <Route path="/wishlist" element={<Favorites />} />
                          <Route path="/comparison" element={<Comparison />} />
                          <Route path="/compare" element={<Comparison />} />
                          <Route path="/search" element={<SearchResults />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<CheckoutV3 />} />
                          <Route path="/checkout/v2" element={<CheckoutV2 />} />
                          <Route path="/checkout/old" element={<Checkout />} />
                          <Route path="/checkout/success" element={<CheckoutSuccess />} />
                          <Route path="/checkout/cancel" element={<Navigate to="/cart" />} />
                          <Route path="/account" element={<Account />} />
                          <Route path="/account/orders" element={<AccountOrders />} />
                          <Route path="/account/orders/:id" element={<OrderDetails />} />
                          <Route path="/account/profile" element={<UserProfile />} />
                          {/* Redirect old routes */}
                          <Route path="/cabinet" element={<Navigate to="/account" />} />
                          <Route path="/cabinet/*" element={<Navigate to="/account" />} />
                          <Route path="/profile" element={<Navigate to="/account" />} />
                          <Route path="/seller/dashboard" element={<Navigate to="/account" />} />
                          <Route path="/admin" element={<AdminPanel />} />
                          <Route path="/admin/pickup-control" element={<PickupControlPage />} />
                          <Route path="/payment/resume/:orderId" element={<PaymentResume />} />
                          <Route path="/contact" element={<ContactInfo />} />
                          <Route path="/delivery-payment" element={<DeliveryPayment />} />
                          <Route path="/exchange-return" element={<ExchangeReturn />} />
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/promotions" element={<Promotions />} />
                          <Route path="/promotion/:promotionId" element={<PromotionDetail />} />
                          <Route path="/section/:slug" element={<SectionDetail />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <Footer />
                        <CompareBar />
                        <ScrollToTop />
                        <FloatingActionButton />
                        {/* Old components removed - replaced by FloatingActionButton */}
                        {/* <AIChatbot /> */}
                        {/* <SupportWidget /> */}
                      </div>
                    </AnalyticsWrapper>
                  </CartProvider>
                  </CatalogProvider>
                </FavoritesProvider>
              </ComparisonProvider>
            </NotificationsProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;