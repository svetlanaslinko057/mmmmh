import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { categoriesAPI, productsAPI } from '../utils/api';
import PopularCategories from '../components/PopularCategories';
import CustomSection from '../components/CustomSection';
import PaymentDeliveryInfo from '../components/PaymentDeliveryInfo';
import SEO from '../components/SEO';
import FeaturedReviews from '../components/FeaturedReviews';
import { useLanguage } from '../contexts/LanguageContext';
import { OrganizationSchema, WebSiteSchema, LocalBusinessSchema } from '../components/seo';

import { 
  DealOfDay, 
  PromoGrid, 
  BrandsStrip, 
  AdvantagesStrip, 
  Testimonials, 
  HeroCarousel,
  ProductSection,
  RecentlyViewed,
  NewsletterBlock,
  NewArrivals
} from '../components/home';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [customSections, setCustomSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, featuredRes, sectionsRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ limit: 12, sort_by: 'popularity' }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/custom-sections`),
      ]);
      
      // Получаем бестселлеры
      const bestsellersRes = await productsAPI.getAll({ limit: 12 });
      const bestsellersData = bestsellersRes.data.filter(p => p.is_bestseller) || bestsellersRes.data.slice(0, 8);
      
      setCategories(categoriesRes.data);
      setFeaturedProducts(featuredRes.data);
      setBestsellers(bestsellersData);
      setCustomSections(sectionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <>
      {/* RETAIL LAYOUT CORE v1 */}
      <main data-testid="home-page">
        {/* Hero Section */}
        <section className="ys-section">
          <div className="ys-container">
            <HeroCarousel />
          </div>
        </section>

        {/* Popular Categories */}
        <section className="ys-section-sm">
          <div className="ys-container">
            <PopularCategories />
          </div>
        </section>

        {/* Advantages Strip */}
        <section className="ys-section-sm">
          <div className="ys-container">
            <AdvantagesStrip />
          </div>
        </section>

        {/* Top Products */}
        <section className="ys-section">
          <div className="ys-container">
            <ProductSection title="Топ продажів" sort="popular" link="/catalog?sort=popular" />
          </div>
        </section>

        {/* Deal of Day */}
        <section className="ys-section">
          <div className="ys-container">
            <DealOfDay />
          </div>
        </section>

        {/* New Arrivals */}
        <section className="ys-section">
          <div className="ys-container">
            <NewArrivals />
          </div>
        </section>

        {/* Promo Grid */}
        <section className="ys-section">
          <div className="ys-container">
            <PromoGrid />
          </div>
        </section>

        {/* Custom Sections */}
        {customSections.map((section) => (
          <section key={section.id} className="ys-section">
            <div className="ys-container">
              <CustomSection sectionData={section} />
            </div>
          </section>
        ))}

        {/* Brands */}
        <section className="ys-section">
          <div className="ys-container">
            <BrandsStrip />
          </div>
        </section>

        {/* Recently Viewed */}
        <section className="ys-section">
          <div className="ys-container">
            <RecentlyViewed />
          </div>
        </section>

        {/* Testimonials */}
        <section className="ys-section">
          <div className="ys-container">
            <Testimonials />
          </div>
        </section>

        {/* Newsletter */}
        <section className="ys-section">
          <div className="ys-container">
            <NewsletterBlock />
          </div>
        </section>

        {/* Full Width Sections */}
        <FeaturedReviews />
        <PaymentDeliveryInfo />
      </main>
    </>
  );
};

export default Home;
