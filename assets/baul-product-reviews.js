(function () {
  function initReviewsCarousel(root) {
    if (!root || root.dataset.bpReviewsReady === '1') return;

    const mediaViewport = root.querySelector('[data-bp-reviews-media]');
    const panels = [...root.querySelectorAll('[data-bp-reviews-panel]')];
    const dotsWrap = root.querySelector('[data-bp-reviews-dots]');

    if (!mediaViewport || panels.length === 0) return;

    root.dataset.bpReviewsReady = '1';

    const scrollItems = [...mediaViewport.querySelectorAll('[data-bp-reviews-index]')];

    if (scrollItems.length === 0) return;

    let dots = [];

    function setActive(index) {
      panels.forEach((panel, panelIndex) => {
        panel.classList.toggle('is-active', panelIndex === index);
        panel.setAttribute('aria-hidden', panelIndex === index ? 'false' : 'true');
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function getClosestIndex() {
      const center = mediaViewport.scrollLeft + mediaViewport.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;

      scrollItems.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(itemCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });

      return closest;
    }

    function scrollToIndex(index) {
      const item = scrollItems[index];
      if (!item) return;

      const target =
        item.offsetLeft - (mediaViewport.clientWidth - item.offsetWidth) / 2;

      mediaViewport.scrollTo({
        left: Math.max(0, target),
        behavior: 'smooth',
      });

      setActive(index);
    }

    function buildDots() {
      if (!dotsWrap) return;

      dotsWrap.innerHTML = '';
      dots = panels.map((_, index) => {
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

    let scrollTimer = null;
    mediaViewport.addEventListener(
      'scroll',
      () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          setActive(getClosestIndex());
        }, 60);
      },
      { passive: true }
    );

    buildDots();
    setActive(0);

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

    const blockEl = document.getElementById('shopify-block-' + blockId);
    if (!blockEl) return;

    const root = blockEl.closest('[data-bp-reviews]');
    if (!root || typeof root._bpReviewsScrollTo !== 'function') {
      initAll();
      return;
    }

    const index = Number(blockEl.dataset.bpReviewsIndex);
    if (!Number.isNaN(index)) root._bpReviewsScrollTo(index);
  });
})();
