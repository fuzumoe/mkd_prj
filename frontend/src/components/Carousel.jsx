import React, { useState, useRef, useEffect } from 'react';
import '../home.css';

const Carousel = () => {
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef();

  const fetchImages = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/carousel/');
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Failed to load carousel images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
     
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-slide effect
  useEffect(() => {
    if (isHovered || images.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, images.length]);

  // Update carousel position on currentSlide change
  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide]);

  return (
    <section
      className="carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="carousel">
        <div className="carousel-track" ref={trackRef}>
          {images.map((img, index) => (
            <div className="carousel-slide" key={img.id || index}>
              <img
                src={img.image.startsWith('http') ? img.image : `http://localhost:8000${img.image}`}
                alt={img.title || `Slide ${index}`}
              />
            </div>
          ))}
        </div>

        <button className="carousel-button prev" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="carousel-button next" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="carousel-dots">
          {images.map((_, index) => (
            <div
              key={index}
              className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
