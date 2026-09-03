(function () {
  var SLIDE_GAP = 10;
  var DESKTOP_MQ = window.matchMedia('(min-width: 750px)');

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

    function getClosestIndex() {
      var gap = readGap();
      var scrollLeft = mediaViewport.scrollLeft;
      var viewportWidth = mediaViewport.clientWidth;

      if (DESKTOP_MQ.matches) {
        var step = scrollItems[0].offsetWidth + gap;
        if (step <= 0) return 0;
        return Math.min(
          scrollItems.length - 1,
          Math.max(0, Math.round(scrollLeft / step))
        );
      }

      var center = scrollLeft + viewportWidth / 2;
      var closest = 0;
      var closestDistance = Infinity;

      scrollItems.forEach(function (item, index) {
        var itemCenter = item.offsetLeft + item.offsetWidth / 2;
        var distance = Math.abs(center - itemCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });

      return closest;
    }

    function setActivePanel(index, animate) {
      activeIndex = index;

      panels.forEach(function (panel, panelIndex) {
        var isActive = panelIndex === index;
        panel.classList.toggle('is-active', isActive);
        panel.style.opacity = isActive ? '1' : '0';
        panel.style.transform = isActive ? 'translateY(0)' : 'translateY(6px)';
        panel.style.visibility = isActive ? 'visible' : 'hidden';
        panel.style.zIndex = isActive ? '2' : '1';
        panel.style.pointerEvents = isActive ? 'auto' : 'none';
        panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');

        if (!animate) {
          panel.style.transition = 'none';
          panel.offsetHeight;
          panel.style.transition = '';
        }
      });

      updateDots(index);
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
      var closest = getClosestIndex();
      if (closest !== activeIndex) {
        setActivePanel(closest, true);
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

      var target;
      if (DESKTOP_MQ.matches) {
        target = item.offsetLeft - parseFloat(getComputedStyle(mediaViewport).paddingLeft || 0);
      } else {
        target =
          item.offsetLeft - (mediaViewport.clientWidth - item.offsetWidth) / 2;
      }

      mediaViewport.scrollTo({
        left: Math.max(0, target),
        behavior: 'smooth',
      });

      setActivePanel(index, true);
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
    window.addEventListener('resize', function () {
      setActivePanel(getClosestIndex(), false);
      scheduleUpdate();
    });

    buildDots();
    setActivePanel(0, false);
    scheduleUpdate();

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
