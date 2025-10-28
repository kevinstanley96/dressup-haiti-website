// javascripts/category-slider.js

// 🛑 FIX: Properly wrapped in an IIFE to prevent global scope pollution and syntax errors.
(function() {
    
    const sliderSection = document.querySelector('.category-slider-section');
    const slider = document.getElementById('categorySlider');

    if (!slider || !sliderSection) return;

    let slideTimeout;

    function onStartSlide() {
      sliderSection.classList.add('sliding');
      clearTimeout(slideTimeout);
    }

    function onEndSlide() {
      slideTimeout = setTimeout(() => {
        sliderSection.classList.remove('sliding');
      }, 120);
    }

    slider.addEventListener('touchstart', onStartSlide, { passive: true });
    slider.addEventListener('touchmove', onStartSlide, { passive: true });
    slider.addEventListener('touchend', onEndSlide);
    slider.addEventListener('touchcancel', onEndSlide);

    let mouseDown = false;
    slider.addEventListener('mousedown', () => {
      mouseDown = true;
      onStartSlide();
    });
    slider.addEventListener('mouseup', () => {
      mouseDown = false;
      onEndSlide();
    });
    slider.addEventListener('mouseleave', () => {
      if(mouseDown) onEndSlide();
    });
})();