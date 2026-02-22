import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  ShoppingBag,
  RefreshCw,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Account = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.all([
          axios.get(`${API_URL}/api/v2/cabinet/orders?limit=1`, { withCredentials: true }),
          axios.get(`${API_URL}/api/v2/cabinet/wishlist`, { withCredentials: true })
        ]);
        setStats({
          orders: ordersRes.data.total || 0,
          wishlist: wishlistRes.data.items?.length || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const T = {
    uk: {
      title: 'Особистий кабінет',
      orders: 'Мої замовлення',
      ordersDesc: 'Історія та статуси замовлень',
      wishlist: 'Обране',
      wishlistDesc: 'Збережені товари',
      profile: 'Профіль',
      profileDesc: 'Особисті дані та контакти',
      addresses: 'Адреси доставки',
      addressesDesc: 'Відділення Нової Пошти',
      payments: 'Способи оплати',
      paymentsDesc: 'Збережені картки',
      settings: 'Налаштування',
      settingsDesc: 'Сповіщення та мова',
      logout: 'Вийти',
      orderCount: 'замовлень',
      inWishlist: 'в обраному'
    },
    ru: {
      title: 'Личный кабинет',
      orders: 'Мои заказы',
      ordersDesc: 'История и статусы заказов',
      wishlist: 'Избранное',
      wishlistDesc: 'Сохраненные товары',
      profile: 'Профиль',
      profileDesc: 'Личные данные и контакты',
      addresses: 'Адреса доставки',
      addressesDesc: 'Отделения Новой Почты',
      payments: 'Способы оплаты',
      paymentsDesc: 'Сохраненные карты',
      settings: 'Настройки',
      settingsDesc: 'Уведомления и язык',
      logout: 'Выйти',
      orderCount: 'заказов',
      inWishlist: 'в избранном'
    }
  };

  const txt = T[language] || T.uk;

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="container-main px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">{txt.title}</h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{user?.full_name || 'User'}</p>
              <div className="flex items-center gap-4 text-gray-500 mt-1">
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stats.orders}</p>
                <p className="text-gray-500">{txt.orderCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stats.wishlist}</p>
                <p className="text-gray-500">{txt.inWishlist}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/account/orders">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{txt.orders}</p>
                    <p className="text-gray-500 text-sm">{txt.ordersDesc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link to="/favorites">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{txt.wishlist}</p>
                    <p className="text-gray-500 text-sm">{txt.wishlistDesc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link to="/account/profile">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{txt.profile}</p>
                    <p className="text-gray-500 text-sm">{txt.profileDesc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link to="/account/addresses">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{txt.addresses}</p>
                    <p className="text-gray-500 text-sm">{txt.addressesDesc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Logout */}
        <div className="mt-8">
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full md:w-auto flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            {txt.logout}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;
