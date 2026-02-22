/**
 * BLOCK V2-20: Product Section
 * Horizontal scrollable product row with title
 */
import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCardCompact from "../ProductCardCompact";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductSection({ title, sort, category, link, icon: Icon }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (category) params.set("category", category);
    params.set("limit", "12");

    fetch(`${API_URL}/api/v2/catalog?${params}`)
      .then(r => r.json())
      .then(d => {
        setItems(d.products || d.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort, category]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const scrollAmount = dir === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="my-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="ys-grid ys-grid-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div data-testid={`product-section-${sort || category}`} className="my-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="ys-section-title flex items-center gap-3 !mb-0">
          {Icon && <Icon className="w-6 h-6 text-blue-600" />}
          {title}
        </h2>
        {link && (
          <Link 
            to={link}
            className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Усі товари <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className="ys-grid ys-grid-4">
        {items.slice(0, 8).map(product => (
          <ProductCardCompact key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
