import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  User, 
  Truck, 
  CreditCard, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Package
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import NovaPoshtaDelivery from '../components/NovaPoshtaDelivery';
import CheckoutTrustStrip from '../components/checkout/CheckoutTrustStrip';
import CheckoutSummarySticky from '../components/checkout/CheckoutSummarySticky';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const FREE_DELIVERY_THRESHOLD = 2000;

const CheckoutV3 = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, cartTotal, clearCart, fetchCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const cartItems = cart?.items || [];

  // Form state
  const [customerData, setCustomerData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const [deliveryData, setDeliveryData] = useState({
    method: 'nova_poshta',
    city_ref: '',
    city_name: '',
    warehouse_ref: '',
    warehouse_name: '',
    delivery_cost: 0
  });

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthSection, setShowAuthSection] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Phone mask formatting
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `+${digits}`;
    if (digits.length <= 5) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    if (digits.length <= 10) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setCustomerData(prev => ({ ...prev, phone: formatted }));
  };

  // Calculate totals
  const subtotal = cartTotal;
  const deliveryCost = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryData.delivery_cost;
  const total = subtotal + deliveryCost;

  // Handle Nova Poshta selection
  const handleNovaPoshtaChange = (data) => {
    setDeliveryData(prev => ({
      ...prev,
      city_ref: data.city_ref || '',
      city_name: data.city_name || '',
      warehouse_ref: data.warehouse_ref || '',
      warehouse_name: data.warehouse_name || '',
      delivery_cost: data.delivery_cost || 0
    }));
  };

  // Google login handler
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/auth-callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Validate step
  const validateStep = (step) => {
    if (step === 1) {
      if (!customerData.full_name.trim()) {
        toast.error("Вкажіть ім'я та прізвище");
        return false;
      }
      if (!customerData.phone || customerData.phone.replace(/\D/g, '').length < 10) {
        toast.error('Вкажіть коректний номер телефону');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (deliveryData.method === 'nova_poshta' && !deliveryData.warehouse_ref) {
        toast.error('Оберіть відділення Нової Пошти');
        return false;
      }
      return true;
    }
    return true;
  };

  // Submit order
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate all steps
    if (!validateStep(1) || !validateStep(2)) return;
    
    if (cartItems.length === 0) {
      toast.error('Кошик порожній');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          full_name: customerData.full_name,
          phone: customerData.phone.replace(/\s/g, ''),
          email: customerData.email || undefined
        },
        delivery: {
          method: deliveryData.method,
          city_ref: deliveryData.city_ref,
          city_name: deliveryData.city_name,
          warehouse_ref: deliveryData.warehouse_ref,
          warehouse_name: deliveryData.warehouse_name,
          delivery_cost: deliveryCost
        },
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        payment_method: paymentMethod,
        comment: comment || undefined
      };

      const response = await axios.post(
        `${API_URL}/api/v2/orders/create`,
        orderPayload,
        { withCredentials: true }
      );

      // Clear cart
      if (isAuthenticated) {
        await clearCart();
      }

      // Redirect to success
      navigate('/checkout/success', {
        state: {
          orderNumber: response.data.order_number,
          orderId: response.data.order_id,
          total: response.data.total_amount
        }
      });

      toast.success('Замовлення успішно оформлено!');

    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.detail || 'Помилка оформлення замовлення');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load cart if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Update customer data from user
  useEffect(() => {
    if (user) {
      setCustomerData(prev => ({
        full_name: user.full_name || prev.full_name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12" data-testid="empty-cart-checkout">
        <div className="container-main px-4 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Кошик порожній</h1>
          <p className="text-gray-600 mb-8">Додайте товари до кошика для оформлення замовлення</p>
          <Button onClick={() => navigate('/products')} className="bg-green-600 hover:bg-green-700">
            Перейти до каталогу
          </Button>
        </div>
      </div>
    );
  }

  // Steps configuration
  const steps = [
    { id: 1, title: 'Контакти', icon: User },
    { id: 2, title: 'Доставка', icon: Truck },
    { id: 3, title: 'Оплата', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="checkout-v3">
      {/* Trust Strip */}
      <CheckoutTrustStrip />

      <div className="container-main px-4 py-8">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Оформлення замовлення
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`flex items-center gap-2 cursor-pointer ${
                  currentStep >= step.id ? 'text-green-600' : 'text-gray-400'
                }`}
                onClick={() => validateStep(currentStep) && currentStep > step.id && setCurrentStep(step.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id 
                    ? 'bg-green-600 text-white'
                    : currentStep === step.id 
                      ? 'bg-green-100 text-green-600 border-2 border-green-600'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`font-medium hidden sm:block ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 md:w-24 h-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Auth Section (Optional) - Always visible for guests */}
              {!isAuthenticated && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowAuthSection(!showAuthSection)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Увійти в акаунт (необов'язково)</span>
                    </div>
                    {showAuthSection ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-blue-600" />}
                  </div>
                  
                  {showAuthSection && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-blue-800 mb-4">
                        Увійдіть, щоб зберегти замовлення в історії та отримати бонуси
                      </p>
                      <Button 
                        type="button"
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 bg-white"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Увійти через Google
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* Step 1: Customer Info */}
              <Card className={`p-6 ${currentStep === 1 ? 'ring-2 ring-green-500' : ''}`} data-testid="step-contacts">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > 1 ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'
                    }`}>
                      {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">1. Контактні дані</h2>
                      {currentStep > 1 && customerData.full_name && (
                        <p className="text-sm text-gray-500">{customerData.full_name}, {customerData.phone}</p>
                      )}
                    </div>
                  </div>
                  {currentStep !== 1 && <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {currentStep === 1 && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Ім'я та прізвище *</Label>
                        <Input
                          id="full_name"
                          value={customerData.full_name}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Іван Іванов"
                          required
                          className="mt-1 h-12"
                          data-testid="input-fullname"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Телефон *</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone"
                            value={customerData.phone}
                            onChange={handlePhoneChange}
                            placeholder="+38 0XX XXX XX XX"
                            required
                            className="pl-11 h-12"
                            data-testid="input-phone"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email (для підтвердження)</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={customerData.email}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="pl-11 h-12"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => validateStep(1) && setCurrentStep(2)}
                      className="w-full h-12 bg-green-600 hover:bg-green-700"
                      data-testid="next-step-1"
                    >
                      Далі — Доставка
                    </Button>
                  </div>
                )}
              </Card>

              {/* Step 2: Delivery */}
              <Card className={`p-6 ${currentStep === 2 ? 'ring-2 ring-green-500' : ''}`} data-testid="step-delivery">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > 2 ? 'bg-green-600 text-white' : currentStep >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">2. Доставка</h2>
                      {currentStep > 2 && deliveryData.warehouse_name && (
                        <p className="text-sm text-gray-500">{deliveryData.city_name}, {deliveryData.warehouse_name}</p>
                      )}
                    </div>
                  </div>
                  {currentStep !== 2 && currentStep > 1 && <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {currentStep === 2 && (
                  <div className="mt-6 space-y-4">
                    <NovaPoshtaDelivery
                      onSelect={handleNovaPoshtaChange}
                      cartTotal={subtotal}
                      freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                    />

                    {/* Free delivery upsell */}
                    {subtotal < FREE_DELIVERY_THRESHOLD && subtotal > 0 && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-800">
                              Безкоштовна доставка від {FREE_DELIVERY_THRESHOLD.toLocaleString()} ₴
                            </p>
                            <p className="text-sm text-green-600">
                              Додайте ще {(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()} ₴ для безкоштовної доставки
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 h-12"
                      >
                        Назад
                      </Button>
                      <Button
                        type="button"
                        onClick={() => validateStep(2) && setCurrentStep(3)}
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                        data-testid="next-step-2"
                      >
                        Далі — Оплата
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Step 3: Payment */}
              <Card className={`p-6 ${currentStep === 3 ? 'ring-2 ring-green-500' : ''}`} data-testid="step-payment">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => currentStep >= 3 && setCurrentStep(3)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= 3 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">3. Оплата</h2>
                  </div>
                  {currentStep !== 3 && currentStep > 2 && <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {currentStep === 3 && (
                  <div className="mt-6 space-y-4">
                    <div className="space-y-3">
                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="cash_on_delivery"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-green-600"
                          data-testid="payment-cod"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Оплата при отриманні</p>
                          <p className="text-sm text-gray-500">Готівкою або карткою у відділенні Нової Пошти</p>
                        </div>
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Популярне
                        </div>
                      </label>

                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-green-600"
                          data-testid="payment-card"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Оплата карткою онлайн</p>
                          <p className="text-sm text-gray-500">Visa, Mastercard — безпечно через платіжний шлюз</p>
                        </div>
                      </label>
                    </div>

                    {/* Comment */}
                    <div>
                      <Label htmlFor="comment">Коментар до замовлення (необов'язково)</Label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Додаткові побажання, уточнення..."
                        rows={3}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                        data-testid="input-comment"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 h-12"
                      >
                        Назад
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <CheckoutSummarySticky
                cartItems={cartItems}
                subtotal={subtotal}
                deliveryCost={deliveryCost}
                total={total}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutV3;
