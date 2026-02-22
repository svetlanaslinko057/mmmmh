import React, { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ProductTabs({ description = "", specs = {}, reviews = [] }) {
  const { language } = useLanguage();
  const t = (uk, ru) => (language === "ru" ? ru : uk);

  const tabs = useMemo(
    () => [
      { k: "desc", label: t("Опис", "Описание") },
      { k: "specs", label: t("Характеристики", "Характеристики") },
      { k: "reviews", label: t("Відгуки", "Отзывы") + (reviews.length ? ` (${reviews.length})` : "") },
    ],
    [language, reviews.length]
  );

  const [tab, setTab] = useState("desc");

  return (
    <div className="ys-tabs" data-testid="product-tabs">
      <div className="ys-tabs-head">
        {tabs.map((x) => (
          <button
            key={x.k}
            type="button"
            className={"ys-tab" + (tab === x.k ? " is-active" : "")}
            onClick={() => setTab(x.k)}
            data-testid={`tab-${x.k}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="ys-tabs-body">
        {tab === "desc" && (
          <div className="ys-prose">
            {description ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              <span className="ys-muted">{t("Опис відсутній.", "Описание отсутствует.")}</span>
            )}
          </div>
        )}

        {tab === "specs" && <SpecsTable specs={specs} />}

        {tab === "reviews" && <Reviews reviews={reviews} />}
      </div>
    </div>
  );
}

function SpecsTable({ specs }) {
  const { language } = useLanguage();
  const t = (uk, ru) => (language === "ru" ? ru : uk);
  
  const entries = Object.entries(specs || {}).filter(
    ([, v]) => v !== null && v !== undefined && String(v).trim() !== ""
  );

  if (!entries.length) {
    return <div className="ys-muted">{t("Характеристики не заповнені.", "Характеристики не заполнены.")}</div>;
  }

  return (
    <div className="ys-specs">
      {entries.map(([k, v]) => (
        <div className="ys-spec-row" key={k}>
          <div className="ys-spec-k">{k}</div>
          <div className="ys-spec-v">{String(v)}</div>
        </div>
      ))}
    </div>
  );
}

function Reviews({ reviews }) {
  const { language } = useLanguage();
  const t = (uk, ru) => (language === "ru" ? ru : uk);
  
  const list = Array.isArray(reviews) ? reviews : [];

  if (!list.length) {
    return <div className="ys-muted">{t("Поки що немає відгуків.", "Пока нет отзывов.")}</div>;
  }

  return (
    <div className="ys-reviews">
      {list.slice(0, 20).map((r, i) => (
        <div className="ys-review" key={i}>
          <div className="ys-review-top">
            <div className="ys-review-name">{r?.name || t("Покупець", "Покупатель")}</div>
            <div className="ys-review-rate">
              {"★".repeat(Math.max(1, Math.min(5, Number(r?.rating || 5))))}
              {"☆".repeat(5 - Math.max(1, Math.min(5, Number(r?.rating || 5))))}
            </div>
          </div>
          {r?.text && <div className="ys-review-text">{r.text}</div>}
        </div>
      ))}
    </div>
  );
}
