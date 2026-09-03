(function () {
  var SLIDE_GAP = 10;

  function initReviewsCarousel(root) {
    if (!root || root.dataset.bpReviewsReady === '1') return;

    var mediaViewport = root.querySelector('[data-bp-reviews-media]');
    var panels = [].slice.call(root.querySelectorAll('[data-bp-reviews-panel]'));
    var dotsWrap = root.querySelector('[data-bp-reviews-dots]');

    if (!mediaViewport || panels.length === 0) return;

    var scrollItems = [].slice.call(
      mediaViewport.querySelectorAll('[data-bp-reviews-index]')
    );
    if (scrollItems.length === 0) return;

    root.dataset.bpReviewsReady = '1';

    var dots = [];
    var activeIndex = 0;
    var rafId = null;

    function readGap() {
      var track = mediaViewport.querySelector('.bp-reviews__media-track');
      if (!track) return SLIDE_GAP;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap);
      return Number.isFinite(gap) ? gap : SLIDE_GAP;
    }

    function updateDots(index) {
      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function updateFromScroll() {
      rafId = null;

      var gap = readGap();
      var center = mediaViewport.scrollLeft + mediaViewport.clientWidth / 2;
      var closest = 0;
      var closestDistance = Infinity;

      scrollItems.forEach(function (item, index) {
        var itemCenter = item.offsetLeft + item.offsetWidth / 2;
        var distance = Math.abs(center - itemCenter);
        var range = item.offsetWidth + gap;
        var progress = Math.max(0, 1 - distance / range);
        var eased = progress * progress * (3 - 2 * progress);
        var panel = panels[index];

        if (panel) {
          panel.style.opacity = String(eased);
          panel.style.transform = 'translateY(' + (1 - eased) * 6 + 'px)';
          panel.style.visibility = eased > 0.03 ? 'visible' : 'hidden';
          panel.setAttribute('aria-hidden', eased < 0.5 ? 'true' : 'false');
        }

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });

      if (closest !== activeIndex) {
        activeIndex = closest;
        updateDots(activeIndex);
      }
    }

    function scheduleUpdate() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateFromScroll);
      }
    }

    function scrollToIndex(index) {
      var item = scrollItems[index];
      if (!item) return;

      var target =
        item.offsetLeft - (mediaViewport.clientWidth - item.offsetWidth) / 2;

      mediaViewport.scrollTo({
        left: Math.max(0, target),
        behavior: 'smooth',
      });

      activeIndex = index;
      updateDots(index);
      scheduleUpdate();
    }

    function buildDots() {
      if (!dotsWrap) return;

      dotsWrap.innerHTML = '';
      dots = panels.map(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'bp-reviews__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Ver reseña ' + (index + 1));
        dot.addEventListener('click', function () {
          scrollToIndex(index);
        });
        dotsWrap.appendChild(dot);
        return dot;
      });
    }

    mediaViewport.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    buildDots();
    updateFromScroll();
    updateDots(0);

    root._bpReviewsScrollTo = scrollToIndex;
  }

  function initAll() {
    document.querySelectorAll('[data-bp-reviews]').forEach(initReviewsCarousel);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('shopify:block:select', function (event) {
    var blockId = event.detail && event.detail.blockId;
    if (!blockId) return;

    var blockEl = document.getElementById('shopify-block-' + blockId);
    if (!blockEl) return;

    var root = blockEl.closest('[data-bp-reviews]');
    if (!root || typeof root._bpReviewsScrollTo !== 'function') {
      initAll();
      return;
    }

    var index = Number(blockEl.dataset.bpReviewsIndex);
    if (!Number.isNaN(index)) root._bpReviewsScrollTo(index);
  });
})();
