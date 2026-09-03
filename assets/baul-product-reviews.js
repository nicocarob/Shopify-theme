(function () {
  function initReviewsCarousel(root) {
    if (!root || root.dataset.bpReviewsReady === '1') return;

    const viewport = root.querySelector('[data-bp-reviews-viewport]');
    const track = root.querySelector('[data-bp-reviews-track]');
    const dotsWrap = root.querySelector('[data-bp-reviews-dots]');
    const slides = [...root.querySelectorAll('[data-bp-reviews-slide]')];

    if (!viewport || !track || !dotsWrap || slides.length === 0) return;

    root.dataset.bpReviewsReady = '1';

    let activeIndex = 0;
    let dots = [];

    function buildDots() {
      dotsWrap.innerHTML = '';
      dots = slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'bp-reviews__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Ver reseña ' + (index + 1));
        dot.addEventListener('click', () => scrollToIndex(index));
        dotsWrap.appendChild(dot);
        return dot;
      });
    }

    function getClosestIndex() {
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;

      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });

      return closest;
    }

    function updateDots(index) {
      activeIndex = index;
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function scrollToIndex(index) {
      const slide = slides[index];
      if (!slide) return;

      const target =
        slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;

      viewport.scrollTo({
        left: Math.max(0, target),
        behavior: 'smooth',
      });
    }

    let scrollTimer = null;
    viewport.addEventListener(
      'scroll',
      () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          updateDots(getClosestIndex());
        }, 80);
      },
      { passive: true }
    );

    buildDots();
    updateDots(0);

    window.addEventListener('resize', () => updateDots(getClosestIndex()));

    root._bpReviewsScrollTo = scrollToIndex;
  }

  function initAll() {
    document.querySelectorAll('[data-bp-reviews]').forEach(initReviewsCarousel);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('shopify:block:select', (event) => {
    const blockId = event.detail && event.detail.blockId;
    if (!blockId) return;

    const slide = document.getElementById('shopify-block-' + blockId);
    if (!slide) return;

    const root = slide.closest('[data-bp-reviews]');
    if (!root || typeof root._bpReviewsScrollTo !== 'function') {
      initAll();
      return;
    }

    const slides = [...root.querySelectorAll('[data-bp-reviews-slide]')];
    const index = slides.indexOf(slide);
    if (index >= 0) root._bpReviewsScrollTo(index);
  });
})();
