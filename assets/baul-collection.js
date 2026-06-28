(function () {
  const grid = document.querySelector('[data-collection-infinite]');
  const sentinel = document.getElementById('bc-infinite-sentinel');
  const status = document.getElementById('bc-infinite-status');
  if (!grid || !sentinel) return;

  let loading = false;
  let nextUrl = sentinel.dataset.nextUrl || '';
  let observer = null;

  function revealCards(cards) {
    cards.forEach((card) => {
      card.classList.add('in');
      grid.appendChild(card);
    });
    if (typeof window.baulInitProductSocialProof === 'function') {
      window.baulInitProductSocialProof();
    }
  }

  async function loadMore() {
    if (loading || !nextUrl) return;
    loading = true;
    if (status) status.hidden = false;

    try {
      const res = await fetch(nextUrl);
      if (!res.ok) throw new Error('Failed to load collection page');

      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const newGrid = doc.querySelector('[data-collection-infinite]');
      const newSentinel = doc.getElementById('bc-infinite-sentinel');

      if (newGrid) {
        revealCards(Array.from(newGrid.querySelectorAll('.pc')));
      }

      nextUrl = newSentinel?.dataset.nextUrl || '';
      sentinel.dataset.nextUrl = nextUrl;

      if (!nextUrl) {
        observer?.disconnect();
        sentinel.remove();
      }
    } catch (e) {
      observer?.disconnect();
    } finally {
      loading = false;
      if (status) status.hidden = true;
    }
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    },
    { rootMargin: '240px' }
  );

  if (nextUrl) observer.observe(sentinel);
})();
