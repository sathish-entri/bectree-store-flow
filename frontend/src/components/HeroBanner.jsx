import { useState, useEffect, useCallback } from 'react';
import SmartWatchGraphic from './SmartWatchGraphic';

// Figma Carousel Slides
const SLIDES = [
  {
    id: 1,
    subtitle: 'Best Deal Online on smart watches',
    title: 'SMART WEARABLE.',
    discount: 'UP to 80% OFF',
    type: 'graphic',
  },
  {
    id: 2,
    subtitle: 'Best Deal Online on smartphones',
    title: 'GALAXY SERIES.',
    discount: 'UP to 56% OFF',
    type: 'image',
    img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
    alt: 'Galaxy S22 Ultra Smartphone',
  },
  {
    id: 3,
    subtitle: 'Best Deal Online on premium audio',
    title: 'WIRELESS SOUND.',
    discount: 'UP to 70% OFF',
    type: 'image',
    img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
    alt: 'High-Fidelity Wireless Headphones',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide(c => (c + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(c => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="hero-banner-container" role="region" aria-label="Featured Promotions Carousel">
      {/* Left Circular Arrow Button */}
      <button
        className="hero-arrow-btn hero-arrow-btn--prev"
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008ECC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Main Banner Body with Background Rings */}
      <div className="hero-card">
        {/* Decorative Concentric Rings in Background (matching Figma) */}
        <div className="hero-bg-rings" aria-hidden="true">
          <div className="hero-ring hero-ring--1" />
          <div className="hero-ring hero-ring--2" />
          <div className="hero-ring hero-ring--3" />
        </div>

        {/* Content Column */}
        <div className="hero-content">
          <p className="hero-subtitle">{slide.subtitle}</p>
          <h2 className="hero-title">{slide.title}</h2>
          <p className="hero-discount">{slide.discount}</p>

          {/* Figma Carousel Dots: 1 active wide pill + 6 small dots */}
          <div className="hero-dots" aria-label="Carousel pagination">
            {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
              const isActive = (currentSlide % SLIDES.length) === (idx % SLIDES.length);
              return (
                <button
                  key={idx}
                  className={`hero-dot${isActive ? ' hero-dot--active' : ''}`}
                  onClick={() => setCurrentSlide(idx % SLIDES.length)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Right Asset / Image Column */}
        <div className="hero-graphic-wrap">
          {slide.type === 'graphic' ? (
            <div className="hero-watch-wrapper">
              <SmartWatchGraphic width={220} height={220} />
            </div>
          ) : (
            <img
              src={slide.img}
              alt={slide.alt}
              className="hero-slide-img"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Right Circular Arrow Button */}
      <button
        className="hero-arrow-btn hero-arrow-btn--next"
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008ECC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
