import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ukTranslations from '../i18n/uk.json';
import ruTranslations from '../i18n/ru.json';
import { translations as flatTranslations } from '../i18n/translations';

const LanguageContext = createContext();

// Deep nested translations (from JSON files)
const nestedTranslations = {
  uk: ukTranslations,
  ua: ukTranslations, // alias
  ru: ruTranslations
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ua');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && ['ru', 'ua', 'uk'].includes(savedLang)) {
      setLanguage(savedLang === 'uk' ? 'ua' : savedLang);
    } else {
      setLanguage('ua');
      localStorage.setItem('language', 'ua');
    }
  }, []);

  const changeLanguage = (lang) => {
    const normalizedLang = lang === 'uk' ? 'ua' : lang;
    setLanguage(normalizedLang);
    localStorage.setItem('language', normalizedLang);
  };

  /**
   * Translation function supporting both flat and nested keys
   * Examples:
   *   t('login') - flat key from translations.js
   *   t('home.dealOfDay') - nested key from uk.json/ru.json
   *   t('common.search') - nested key
   */
  const t = useCallback((key, params = {}) => {
    // First try nested translations (uk.json/ru.json)
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = nestedTranslations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
      
      if (typeof value === 'string') {
        // Replace params like {count}, {name}
        return Object.entries(params).reduce(
          (str, [paramKey, paramValue]) => str.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue),
          value
        );
      }
    }
    
    // Try flat translations (translations.js)
    const flatValue = flatTranslations[language]?.[key];
    if (flatValue) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue),
        flatValue
      );
    }
    
    // Fallback: return the key itself
    return key;
  }, [language]);

  /**
   * Get all translations for a namespace
   * Example: tNs('home') returns {dealOfDay: '...', popularCategories: '...', ...}
   */
  const tNs = useCallback((namespace) => {
    return nestedTranslations[language]?.[namespace] || {};
  }, [language]);

  const value = {
    language,
    changeLanguage,
    t,
    tNs,
    // Available languages
    languages: [
      { code: 'ua', name: 'Українська', flag: '🇺🇦' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ]
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export default LanguageContext;
