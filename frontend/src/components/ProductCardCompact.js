import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ChevronLeft, ChevronRight, Scale, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

const ProductCardCompact = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = useComparison();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product.id);
    toast.success('Додано в кошик');
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success('Видалено з обраного');
    } else {
      addToFavorites(product);
      toast.success('Додано в обране');
    }
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
      toast.success('Видалено з порівняння');
    } else {
      if (canAddMore()) {
        addToComparison(product);
        toast.success('Додано до порівняння');
      } else {
        toast.error('Максимум 4 товари для порівняння');
      }
    }
  };

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const finalPrice = product.price;
  
  // Get all images or fallback
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/300'];

  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="ys-card group cursor-pointer"
      data-testid={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div 
        className="ys-card-media"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="ys-card-badge">-{discount}%</span>
        )}

        {/* Action Buttons - Top Right */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            data-testid={`wishlist-btn-${product.id}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
              isFavorite(product.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            title="Додати в обране"
          >
            <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
          
          {/* Compare Button */}
          <button
            onClick={handleToggleCompare}
            data-testid={`compare-btn-${product.id}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
              isInComparison(product.id) 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-blue-500'
            }`}
            title="Порівняти"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image */}
        <img
          src={images[currentImageIndex]}
          alt={product.title || product.name}
        />

        {/* Quick View on Hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
              className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Швидкий перегляд
            </button>
          </div>
        )}

        {/* Image Navigation Arrows */}
        {hasMultipleImages && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg z-10"
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg z-10"
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {images.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImageIndex === index 
                    ? 'bg-white w-3' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="ys-card-body">
        {/* Product Title */}
        <h3 className="ys-card-title">
          {product.title || product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviews_count || 0})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="ys-card-priceRow">
          <span className="ys-card-price">${finalPrice.toFixed(2)}</span>
          {product.compare_price && (
            <span className="ys-card-old">${product.compare_price.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="ys-card-actions">
          <button
            onClick={handleAddToCart}
            data-testid={`add-to-cart-${product.id}`}
            className="ys-btn flex-1"
            style={{ background: '#0A84FF', color: '#fff' }}
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardCompact;
