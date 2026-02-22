/**
 * BLOCK V2-21: New Arrivals Section
 * Shows recently added products
 */
import React, { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCardCompact from "../ProductCardCompact";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function NewArrivals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v2/catalog?sort=-created_at&limit=8`)
      .then(r => r.json())
      .then(d => {
        setItems(d.products || d.items || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to regular products
        fetch(`${API_URL}/api/products?limit=8`)
          .then(r => r.json())
          .then(d => {
            setItems(Array.isArray(d) ? d : (d.products || []));
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  if (loading) {
    return (
      <div className="ys-section">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="ys-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div data-testid="new-arrivals-section" className="ys-section">
      <div className="ys-section-header">
        <h2 className="ys-section-title">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Новинки
        </h2>
        <Link to="/catalog?sort=-created_at" className="ys-section-link">
          Усі новинки <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="ys-grid">
        {items.slice(0, 8).map(product => (
          <ProductCardCompact 
            key={product.id || product._id} 
            product={product}
            badge={{ text: "Новинка", color: "purple" }}
          />
        ))}
      </div>
    </div>
  );
}
