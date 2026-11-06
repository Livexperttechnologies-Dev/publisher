/**
 * KIBO360 - Navigation & Header Interactivity
 */
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navDropdown = document.querySelector('.nav-dropdown');
  const dropdownLabel = document.querySelector('.nav-dropdown-label');
  const navbar = document.querySelector('.navbar');

  // Mobile hamburger toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Mobile dropdown toggle
  if (dropdownLabel && navDropdown) {
    dropdownLabel.addEventListener('click', (e) => {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        navDropdown.classList.toggle('open');
      }
    });
  }

  // Navbar shadow on scroll
  const onScroll = () => {
    if (navbar) {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
