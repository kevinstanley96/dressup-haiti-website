document.getElementById('openMenuBtn').addEventListener('click', function() {
  document.getElementById('menuPanel').classList.add('open');
});

document.getElementById('closeMenuBtn').addEventListener('click', function() {
  document.getElementById('menuPanel').classList.remove('open');
});

const menuPanel = document.getElementById('menuPanel');
const menuOverlay = document.getElementById('menuOverlay');
const openMenuBtn = document.getElementById('openMenuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');

function openMenu() {
  menuPanel.classList.add('open');
  menuOverlay.classList.add('open');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeMenu() {
  menuPanel.classList.remove('open');
  menuOverlay.classList.remove('open');
  document.body.style.overflow = ''; // Allow scrolling
}

openMenuBtn.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu); // Click on overlay also closes menu
