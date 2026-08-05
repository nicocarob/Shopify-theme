(function () {
  'use strict';

  function scrollItemIntoView(item, container) {
    if (!item || !container) return;
    var containerRect = container.getBoundingClientRect();
    var itemRect = item.getBoundingClientRect();
    var overflowLeft = itemRect.left < containerRect.left + 8;
    var overflowRight = itemRect.right > containerRect.right - 8;

    if (overflowLeft || overflowRight) {
      item.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }

  function updateScrollFades(wrap) {
    if (!wrap) return;
    var scroller = wrap.querySelector('.elige-liga__tabs, .elige-liga__teams');
    if (!scroller) return;

    var maxScroll = scroller.scrollWidth - scroller.clientWidth;
    var scrollable = maxScroll > 4;
    wrap.classList.toggle('is-scrollable', scrollable);
    wrap.classList.toggle('is-at-start', scroller.scrollLeft <= 4);
    wrap.classList.toggle('is-at-end', scroller.scrollLeft >= maxScroll - 4);
  }

  function bindScrollFades(root) {
    root.querySelectorAll('[data-elige-scroll]').forEach(function (wrap) {
      var scroller = wrap.querySelector('.elige-liga__tabs, .elige-liga__teams');
      if (!scroller) return;

      var onScroll = function () {
        updateScrollFades(wrap);
      };

      scroller.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    });
  }

  function showProducts(panel, teamId) {
    panel.querySelectorAll('[data-team-products]').forEach(function (block) {
      var match = block.getAttribute('data-team-products') === teamId;
      block.hidden = !match;

      if (match) {
        block.classList.remove('is-visible');
        void block.offsetWidth;
        block.classList.add('is-visible');
      }
    });
  }

  function selectTeam(btn) {
    if (!btn) return;
    var panel = btn.closest('[data-liga-panel]');
    if (!panel) return;

    panel.querySelectorAll('[data-team-btn]').forEach(function (b) {
      var active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var teamId = btn.getAttribute('data-team-id') || 'all';
    showProducts(panel, teamId);

    var teamsWrap = panel.querySelector('.elige-liga__scroll-wrap--teams');
    var teamsScroller = teamsWrap && teamsWrap.querySelector('.elige-liga__teams');
    if (teamsScroller) {
      scrollItemIntoView(btn, teamsScroller);
    }

    var cta = panel.querySelector('[data-liga-cta]');
    if (!cta) return;

    var url = btn.getAttribute('data-team-url') || '#';
    var ligaName = panel.getAttribute('data-liga-name') || '';
    var teamName = btn.getAttribute('data-team-name') || 'Todos';

    cta.href = url;
    if (btn.hasAttribute('data-team-all')) {
      cta.textContent = 'Ver el resto de camisetas de ' + ligaName;
    } else {
      cta.textContent = 'Ver camisetas de ' + teamName;
    }
  }

  function activateLiga(root, ligaId) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-liga-tab]'));

    tabs.forEach(function (tab) {
      var active = tab.getAttribute('data-liga-tab') === ligaId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });

    root.querySelectorAll('[data-liga-panel]').forEach(function (panel) {
      var active = panel.getAttribute('data-liga-panel') === ligaId;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    var activeTab = root.querySelector('[data-liga-tab="' + ligaId + '"]');
    var tabsWrap = root.querySelector('.elige-liga__scroll-wrap--tabs');
    var tabsScroller = tabsWrap && tabsWrap.querySelector('.elige-liga__tabs');
    if (activeTab && tabsScroller) {
      scrollItemIntoView(activeTab, tabsScroller);
    }

    var panel = root.querySelector('[data-liga-panel="' + ligaId + '"]');
    if (panel) {
      var teamsScroller = panel.querySelector('.elige-liga__teams');
      if (teamsScroller) {
        teamsScroller.scrollLeft = 0;
      }
      selectTeam(panel.querySelector('[data-team-all]'));
      panel.querySelectorAll('[data-elige-scroll]').forEach(updateScrollFades);
    }
  }

  function focusTab(tabs, index) {
    if (!tabs.length) return;
    var next = tabs[index];
    if (!next) return;
    next.focus();
    next.click();
  }

  function init(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-liga-tab]'));

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateLiga(root, tab.getAttribute('data-liga-tab'));
      });

      tab.addEventListener('keydown', function (event) {
        var currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex < 0) currentIndex = tabs.indexOf(tab);

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          focusTab(tabs, (currentIndex + 1) % tabs.length);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          focusTab(tabs, (currentIndex - 1 + tabs.length) % tabs.length);
        } else if (event.key === 'Home') {
          event.preventDefault();
          focusTab(tabs, 0);
        } else if (event.key === 'End') {
          event.preventDefault();
          focusTab(tabs, tabs.length - 1);
        }
      });
    });

    root.querySelectorAll('[data-team-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectTeam(btn);
      });
    });

    bindScrollFades(root);

    var firstTab = tabs[0];
    if (firstTab) {
      activateLiga(root, firstTab.getAttribute('data-liga-tab'));
    }
  }

  function boot() {
    document.querySelectorAll('[data-elige-liga]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
