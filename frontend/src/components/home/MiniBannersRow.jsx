import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MiniBannersRow() {
  const { language } = useLanguage();
  const t = (uk, ru) => (language === "ru" ? ru : uk);

  const banners = [
    {
      title: t("Топ смартфони", "Топ смартфоны"),
      text: t("Хіти продажу + вигідні ціни", "Хиты продаж + выгодные цены"),
      to: "/catalog?category=smartphones",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: t("Ноутбуки для роботи", "Ноутбуки для работы"),
      text: t("Офіс, навчання, ігри", "Офис, учеба, игры"),
      to: "/catalog?category=laptops",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: t("Розумний дім", "Умный дом"),
      text: t("Датчики, камери, хаби", "Датчики, камеры, хабы"),
      to: "/catalog?category=smart-home",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
  ];

  return (
    <div className="ys-mini-banners">
      {banners.map((b, i) => (
        <Link 
          className="ys-mini-banner" 
          key={i} 
          to={b.to}
          style={{ background: b.gradient }}
          data-testid={`mini-banner-${i}`}
        >
          <h3>{b.title}</h3>
          <p>{b.text}</p>
          <span className="ys-mini-cta">
            {t("Дивитись", "Смотреть")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: 4}}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </Link>
      ))}
    </div>
  );
}
