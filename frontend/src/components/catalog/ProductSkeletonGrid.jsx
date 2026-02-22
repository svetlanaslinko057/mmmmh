/**
 * ProductSkeletonGrid - скелетоны загрузки для товаров
 */
import React from "react";

function Skel() {
  return (
    <div className="ys-card ys-skel" style={{ padding: 12, borderRadius: 16, background: "#fff", border: "1px solid #e5e7eb" }}>
      <div className="ys-skel__img" />
      <div className="ys-skel__line" />
      <div className="ys-skel__line ys-skel__line--sm" />
      <div className="ys-skel__row">
        <div className="ys-skel__pill" />
        <div className="ys-skel__pill" />
      </div>
    </div>
  );
}

export default function ProductSkeletonGrid({ count = 12 }) {
  return (
    <div className="ys-products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <Skel key={i} />
      ))}
    </div>
  );
}
