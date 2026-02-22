import React from "react";

export default function Pagination({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;

  const maxButtons = 7;
  const half = Math.floor(maxButtons / 2);

  let start = Math.max(1, page - half);
  let end = Math.min(pages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="ys-pagination">
      <button className="ys-btn ys-btn-secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ←
      </button>

      {start > 1 && (
        <>
          <button className="ys-btn ys-btn-secondary" onClick={() => onPage(1)}>
            1
          </button>
          {start > 2 && <span className="ys-pagination__dots">…</span>}
        </>
      )}

      {nums.map((n) => (
        <button
          key={n}
          className={`ys-btn ys-btn-secondary ${n === page ? "is-active" : ""}`}
          onClick={() => onPage(n)}
        >
          {n}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="ys-pagination__dots">…</span>}
          <button className="ys-btn ys-btn-secondary" onClick={() => onPage(pages)}>
            {pages}
          </button>
        </>
      )}

      <button className="ys-btn ys-btn-secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        →
      </button>
    </div>
  );
}
