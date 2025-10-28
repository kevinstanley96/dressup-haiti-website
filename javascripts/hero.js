// hero.js
const heroImages = [
  document.getElementById('heroImg1'),
  document.getElementById('heroImg2')
];

let currentIndex = 0;

setInterval(() => {
  // Remove 'active' from all
  heroImages.forEach(img => img.classList.remove('active'));
  // Next image index
  currentIndex = (currentIndex + 1) % heroImages.length;
  // Add 'active' to the current one
  heroImages[currentIndex].classList.add('active');
}, 15000); // 15000ms = 15s
