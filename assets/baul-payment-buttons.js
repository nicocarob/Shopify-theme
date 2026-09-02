(function () {
  const CARD_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';

  const BANK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M3 10h18"/><path d="M5 10v9"/><path d="M9 10v9"/><path d="M15 10v9"/><path d="M19 10v9"/><path d="M2 19h20"/><path d="M12 3l9 7H3l9-7z"/></svg>';

  function buildDualContent(title, subtitle, iconHtml) {
    return (
      '<span class="payment-btn__layout">' +
      '<span class="payment-btn__icon">' +
      iconHtml +
      '</span>' +
      '<span class="payment-btn__copy">' +
      '<strong class="payment-btn__title">' +
      title +
      '</strong>' +
      '<span class="payment-btn__subtitle">' +
      subtitle +
      '</span>' +
      '</span>' +
      '</span>'
    );
  }

  function isOverlayElement(el) {
    if (!el) return true;
    const style = el.getAttribute('style') || '';
    return (
      style.includes('position: absolute') ||
      style.includes('position:absolute') ||
      style.includes('z-index: 2147483647')
    );
  }

  function ensureShadowStyles(shadowRoot) {
    if (!shadowRoot || shadowRoot.querySelector('#baul-payment-btn-styles')) return;

    const style = document.createElement('style');
    style.id = 'baul-payment-btn-styles';
    style.textContent =
      'button.payment-btn-dual{display:flex!important;align-items:center!important;justify-content:flex-start!important;text-align:left!important;width:100%!important;min-height:72px!important;height:auto!important;padding:14px 18px!important;background:#fff!important;border:none!important;border-radius:14px!important}' +
      '.payment-btn__layout{display:flex;align-items:center;gap:14px;width:100%}' +
      '.payment-btn__icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;min-width:28px}' +
      '.payment-btn__icon svg{width:26px;height:26px}' +
      '.payment-btn__copy{display:flex;flex-direction:column;gap:2px;min-width:0}' +
      '.payment-btn__title{display:block;font-size:15px;font-weight:700;line-height:1.25;color:#000!important}' +
      '.payment-btn__subtitle{display:block;font-size:12px;font-weight:400;line-height:1.3;color:#666!important}';
    shadowRoot.appendChild(style);
  }

  function enhanceFintocButton(button) {
    if (!button || button.dataset.baulPaymentEnhanced === 'fintoc') return;
    if (button.querySelector('.payment-btn__title')) {
      button.dataset.baulPaymentEnhanced = 'fintoc';
      return;
    }

    const root = button.getRootNode();
    if (root instanceof ShadowRoot) ensureShadowStyles(root);

    const icon =
      button.querySelector('img')?.outerHTML ||
      button.querySelector('[part="icon"]')?.innerHTML ||
      BANK_ICON;

    button.dataset.baulPaymentEnhanced = 'fintoc';
    button.classList.add('payment-btn-dual', 'payment-btn-dual--fintoc');
    button.innerHTML = buildDualContent(
      'Pagar con mi banco con 5% de descuento',
      'Sin tarjeta • Pago bancario con Fintoc',
      icon
    );
  }

  function findFintocButton() {
    const form = document.getElementById('baul-product-form');
    const searchRoot = form || document;

    const scalaHost = searchRoot.querySelector('scala-cart-button');
    if (scalaHost?.shadowRoot) {
      return (
        scalaHost.shadowRoot.querySelector('#scala-button') ||
        scalaHost.shadowRoot.querySelector('button[data-trigger]') ||
        scalaHost.shadowRoot.querySelector('button')
      );
    }

    const candidates = [
      ...searchRoot.querySelectorAll(
        '.bp-app-block button, .easify-product-options button, .tpo-buy-it-now-btn, button[id*="scala"]'
      ),
    ].filter(
      (el) =>
        !isOverlayElement(el) &&
        el.id !== 'bp-buy-btn' &&
        !el.classList.contains('payment-btn-dual--card')
    );

    const byText = candidates.find((btn) =>
      /5%\s*de descuento|transferencia|fintoc|descuento extra|buy.it.now/i.test(
        btn.textContent || btn.value || ''
      )
    );
    if (byText) return byText;

    return (
      candidates.find(
        (btn) =>
          btn.classList.contains('tpo-buy-it-now-btn') ||
          btn.closest('.bp-app-block, .easify-product-options')
      ) || null
    );
  }

  function hideOverlayButtons() {
    document.querySelectorAll('.tpo-buy-it-now-btn').forEach((el) => {
      if (isOverlayElement(el)) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      }
    });
  }

  function initPaymentButtons() {
    if (!document.getElementById('baul-product-form')) return;

    hideOverlayButtons();

    const fintocButton = findFintocButton();
    if (fintocButton) enhanceFintocButton(fintocButton);
  }

  document.addEventListener('DOMContentLoaded', initPaymentButtons);

  new MutationObserver(initPaymentButtons).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  [300, 800, 1500, 2500, 4000, 7000].forEach((ms) => {
    window.setTimeout(initPaymentButtons, ms);
  });
})();
