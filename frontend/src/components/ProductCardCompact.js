import React from "react";
import { Link } from "react-router-dom";

const formatUAH = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("uk-UA").format(n) + " грн";
};

export default function ProductCardCompact({ product }) {
  const p = product || {};
  const title = p.title || p.name || "";
  const img = p.image || (Array.isArray(p.images) ? p.images[0] : null);

  const price = p.price ?? 0;
  const oldPrice = p.old_price ?? p.compare_price ?? null;
  const discount =
    oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

  const inStock = p.in_stock !== false && (p.stock_level === undefined || p.stock_level > 0);

  return (
    <Link to={`/product/${p.slug || p.id}`} className="ys-pcard" aria-label={title} data-testid="product-card">
      <div className="ys-pcard-media">
        {discount ? <div className="ys-badge-discount">-{discount}%</div> : null}

        <div className="ys-imgbox">
          {img ? (
            <img
              src={img}
              alt={title}
              loading="lazy"
              decoding="async"
              className="ys-pcard-img"
            />
          ) : (
            <div className="ys-img-placeholder">📦</div>
          )}
        </div>
      </div>

      <div className="ys-pcard-body">
        <div className="ys-pcard-title" title={title}>
          {title}
        </div>

        <div className="ys-pcard-meta">
          <span className={`ys-stock ${inStock ? "is-ok" : "is-no"}`}>
            {inStock ? "Є в наявності" : "Немає"}
          </span>

          {p.rating ? (
            <span className="ys-rating" title="Рейтинг">
              ⭐ {Number(p.rating).toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="ys-pcard-footer">
          <div className="ys-price">
            <div className="ys-price-now">{formatUAH(price)}</div>
            {oldPrice ? <div className="ys-price-old">{formatUAH(oldPrice)}</div> : null}
          </div>

          <button className="ys-btn ys-btn-cart" type="button" onClick={(e) => e.preventDefault()}>
            У кошик
          </button>
        </div>
      </div>
    </Link>
  );
}
