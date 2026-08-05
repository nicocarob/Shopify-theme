(function () {
  'use strict';

  function selectTeam(btn) {
    if (!btn) return;
    var panel = btn.closest('[data-liga-panel]');
    if (!panel) return;

    panel.querySelectorAll('[data-team-btn]').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });

    var teamId = btn.getAttribute('data-team-id') || 'all';
    panel.querySelectorAll('[data-team-products]').forEach(function (grid) {
      var match = grid.getAttribute('data-team-products') === teamId;
      grid.hidden = !match;
    });

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
    root.querySelectorAll('[data-liga-tab]').forEach(function (tab) {
      var active = tab.getAttribute('data-liga-tab') === ligaId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    root.querySelectorAll('[data-liga-panel]').forEach(function (panel) {
      var active = panel.getAttribute('data-liga-panel') === ligaId;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    var panel = root.querySelector('[data-liga-panel="' + ligaId + '"]');
    if (panel) {
      selectTeam(panel.querySelector('[data-team-all]'));
    }
  }

  function init(root) {
    root.querySelectorAll('[data-liga-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateLiga(root, tab.getAttribute('data-liga-tab'));
      });
    });

    root.querySelectorAll('[data-team-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectTeam(btn);
      });
    });

    var firstTab = root.querySelector('[data-liga-tab]');
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
