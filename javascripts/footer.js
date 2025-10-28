// Example: Automatically update copyright year
document.addEventListener("DOMContentLoaded", function() {
  const yearSpan = document.querySelector('.footer-bottom span');
  if(yearSpan){
    yearSpan.innerHTML = `&copy; ${new Date().getFullYear()} DRESSUP HAITI. All rights reserved.`;
  }
});
