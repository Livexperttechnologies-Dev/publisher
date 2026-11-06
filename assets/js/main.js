/**
 * KIBO360 - Main Interactivity (Orbit, Marquee, Scroller, Tabs, Back-to-Top)
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll-reveal intersection observer
  const sections = document.querySelectorAll('main section');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    sections.forEach(s => {
      s.classList.add('fade-section');
      observer.observe(s);
    });
  }

  // 2. Product horizontal scroller controls
  const scroller = document.querySelector('.product-scroller');
  const prevBtn = document.querySelector('.scroller-arrow[aria-label="Previous products"]');
  const nextBtn = document.querySelector('.scroller-arrow[aria-label="Next products"]');

  if (scroller && prevBtn && nextBtn) {
    const updateScrollerArrows = () => {
      const scrollLeft = scroller.scrollLeft;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth - 4;
      prevBtn.disabled = scrollLeft <= 4;
      nextBtn.disabled = scrollLeft >= maxScroll;
    };

    const scrollByAmount = (direction) => {
      const card = scroller.querySelector('.product-card');
      const width = card ? card.getBoundingClientRect().width + 18 : 300;
      scroller.scrollBy({ left: direction * width, behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByAmount(-1));
    nextBtn.addEventListener('click', () => scrollByAmount(1));
    scroller.addEventListener('scroll', updateScrollerArrows, { passive: true });
    window.addEventListener('resize', updateScrollerArrows, { passive: true });
    updateScrollerArrows();
  }

  // 3. Integrations Marquee pause / play control
  const marqueeTrack = document.querySelector('.marquee-track');
  const marqueePauseBtn = document.querySelector('.marquee-pause');

  if (marqueeTrack && marqueePauseBtn) {
    let isPaused = false;
    marqueePauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      marqueeTrack.style.animationPlayState = isPaused ? 'paused' : 'running';
      marqueePauseBtn.setAttribute('aria-pressed', isPaused.toString());
      marqueePauseBtn.textContent = isPaused ? '▶ Play animation' : '❚❚ Pause animation';
    });
  }

  // 4. Back to Top Floating Button
  let backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.innerHTML = '↑';
    document.body.appendChild(backToTopBtn);
  }

  const toggleBackToTop = () => {
    if (window.scrollY > 600) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });

  // 5. Interactive Module Tabs (used in HMS page)
  const tabsNav = document.querySelectorAll('.tabs-nav .tab-chip');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabsNav.length > 0 && tabPanels.length > 0) {
    tabsNav.forEach((chip, index) => {
      chip.addEventListener('click', () => {
        tabsNav.forEach(c => c.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        chip.classList.add('active');
        if (tabPanels[index]) tabPanels[index].classList.add('active');
      });
    });
  }
});
