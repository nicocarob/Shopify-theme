(function () {
  const TIMEZONE = 'America/Santiago';

  function getChileDate() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function updateCountdown(root) {
    const timer = root.querySelector('[data-ship-countdown]');
    if (!timer) return;

    const cutoffHour = parseInt(root.dataset.cutoffHour || '16', 10);
    const now = getChileDate();
    const deadline = new Date(now);

    deadline.setHours(cutoffHour, 0, 0, 0);
    if (now >= deadline) {
      deadline.setDate(deadline.getDate() + 1);
    }

    const diff = Math.max(0, deadline - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    timer.textContent = pad(hours) + 'h ' + pad(minutes) + 'm ' + pad(seconds) + 's';
  }

  function initShipCountdowns() {
    document.querySelectorAll('.bp-ship-countdown').forEach((root) => {
      updateCountdown(root);
    });
  }

  document.addEventListener('DOMContentLoaded', initShipCountdowns);
  window.setInterval(initShipCountdowns, 1000);
})();
