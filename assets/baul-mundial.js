(function () {
  const groupsSection = document.getElementById('bm-groups');
  if (!groupsSection) return;

  const groupGrid = document.getElementById('bm-group-grid');
  const filterBanner = document.getElementById('bm-filter-banner');
  const filterFlag = document.getElementById('bm-filter-flag');
  const filterName = document.getElementById('bm-filter-name');
  const filterClear = document.getElementById('bm-filter-clear');
  const productsSection = document.getElementById('bm-products');
  const productsTitle = document.getElementById('bm-products-title');
  const productsGrid = document.getElementById('bm-products-grid');
  const emptyMsg = document.getElementById('bm-empty');
  const clearAllBtn = document.getElementById('bm-clear-all');
  const productItems = productsGrid ? productsGrid.querySelectorAll('.bm-product-item') : [];

  function normTag(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function productMatchesTag(item, tag) {
    const tags = (item.dataset.tags || '').split('|').filter(Boolean);
    const target = normTag(tag);
    return tags.some((t) => {
      const n = normTag(t);
      return n === target || n.includes(target) || target.includes(n);
    });
  }

  function setActiveCountry(btn) {
    document.querySelectorAll('.bm-country.is-active').forEach((el) => el.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
  }

  function clearFilter() {
    setActiveCountry(null);
    filterBanner.hidden = true;
    productsSection.hidden = true;
    groupGrid.hidden = false;
    emptyMsg.hidden = true;
    productItems.forEach((item) => {
      item.hidden = false;
    });
  }

  function applyCountryFilter(btn) {
    const tag = btn.dataset.tag;
    const name = btn.dataset.name;
    const flag = btn.dataset.flag;

    setActiveCountry(btn);
    filterFlag.textContent = flag;
    filterName.textContent = name;
    filterBanner.hidden = false;
    groupGrid.hidden = false;

    productsTitle.textContent = 'CAMISETAS DE ' + name.toUpperCase();
    productsSection.hidden = false;

    let visible = 0;
    productItems.forEach((item) => {
      const show = productMatchesTag(item, tag);
      item.hidden = !show;
      if (show) visible += 1;
    });

    emptyMsg.hidden = visible > 0;

    requestAnimationFrame(() => {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  document.querySelectorAll('.bm-country').forEach((btn) => {
    btn.addEventListener('click', () => applyCountryFilter(btn));
  });

  if (filterClear) filterClear.addEventListener('click', clearFilter);
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearFilter);
})();
