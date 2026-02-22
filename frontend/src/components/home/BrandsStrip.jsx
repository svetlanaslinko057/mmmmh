/**
 * BLOCK V2-20 PRO: Brands Strip
 * Horizontal scrolling brand logos with hover pause
 */
import React from "react";
import { Link } from "react-router-dom";

const brands = [
  { name: "Apple", logo: "🍎", slug: "apple" },
  { name: "Samsung", logo: "📱", slug: "samsung" },
  { name: "Sony", logo: "🎮", slug: "sony" },
  { name: "LG", logo: "📺", slug: "lg" },
  { name: "Xiaomi", logo: "🔶", slug: "xiaomi" },
  { name: "Huawei", logo: "🌐", slug: "huawei" },
  { name: "Google", logo: "🔍", slug: "google" },
  { name: "Microsoft", logo: "🪟", slug: "microsoft" },
  { name: "Dell", logo: "💻", slug: "dell" },
  { name: "HP", logo: "🖥️", slug: "hp" },
  { name: "Lenovo", logo: "💼", slug: "lenovo" },
  { name: "ASUS", logo: "🎯", slug: "asus" },
];

export default function BrandsStrip() {
  return (
    <div data-testid="brands-strip" className="ys-section ys-brands">
      <h2 className="ys-brands-title">Популярні бренди</h2>
      
      <div className="ys-brands-track">
        {/* Double the items for seamless loop */}
        {[...brands, ...brands].map((brand, i) => (
          <Link 
            key={`${brand.slug}-${i}`}
            to={`/catalog?brand=${brand.slug}`}
            className="ys-brand-item"
          >
            <span className="ys-brand-logo">{brand.logo}</span>
            <span className="ys-brand-name">{brand.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
