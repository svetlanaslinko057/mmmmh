import React from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Laptop, Tv, Headphones } from "lucide-react";

/**
 * PromoGrid - Hot offers grid
 * BLOCK V2-14: Homepage Retail Component
 */
const PromoGrid = () => {
  const navigate = useNavigate();

  const promos = [
    {
      title: "Смартфони",
      subtitle: "До -30%",
      category: "smartphones",
      gradient: "from-violet-600 to-purple-700",
      icon: Smartphone,
    },
    {
      title: "Ноутбуки",
      subtitle: "USB-C зарядка",
      category: "laptops",
      gradient: "from-blue-600 to-cyan-600",
      icon: Laptop,
    },
    {
      title: "Телевізори",
      subtitle: "4K / Smart TV",
      category: "tv",
      gradient: "from-emerald-600 to-teal-600",
      icon: Tv,
    },
    {
      title: "Аксесуари",
      subtitle: "До -50%",
      category: "accessories",
      gradient: "from-orange-500 to-red-500",
      icon: Headphones,
    },
  ];

  return (
    <div className="promo-grid" data-testid="promo-grid">
      <h2 className="section-title">Гарячі пропозиції</h2>
      
      <div className="promo-grid-items">
        {promos.map((p, index) => (
          <div
            key={index}
            onClick={() => navigate(`/catalog?category=${p.category}`)}
            className={`promo-card bg-gradient-to-br ${p.gradient}`}
            data-testid={`promo-card-${p.category}`}
          >
            <div className="promo-card-content">
              <p.icon size={32} className="promo-card-icon" />
              <div className="promo-card-text">
                <h3 className="promo-card-title">{p.title}</h3>
                <p className="promo-card-subtitle">{p.subtitle}</p>
              </div>
            </div>
            <div className="promo-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoGrid;
