// category-slider.js

// 🛑 FIX: Added IIFE wrapper to prevent SyntaxError and global scope pollution.
(function() {
    const sliderSection = document.querySelector('.category-slider-section');
    const slider = document.getElementById('categorySlider');

    // Add a null check for safety, in case the element isn't on the page (e.g., checkout.html)
    if (!slider) return; 

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

    // Touch events for mobile
    slider.addEventListener('touchstart', onStartSlide, { passive: true });
    slider.addEventListener('touchmove', onStartSlide, { passive: true });
    slider.addEventListener('touchend', onEndSlide);
    slider.addEventListener('touchcancel', onEndSlide);

    // Mouse events for desktop drag
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
// 🛑 FIX: This closing bracket and function invocation were missing/incorrect.
})();