export const PAYMENT_SYNC_EVENT = 'oebipas:payment-sync';

export const markPaymentSync = () => {
  const syncedAt = String(Date.now());
  sessionStorage.setItem('oebipas:last-payment-sync', syncedAt);
  window.dispatchEvent(new CustomEvent(PAYMENT_SYNC_EVENT, { detail: { syncedAt } }));
};

export const subscribeToPaymentSync = callback => {
  const runCallback = () => {
    Promise.resolve(callback()).catch(() => {});
  };

  window.addEventListener(PAYMENT_SYNC_EVENT, runCallback);
  window.addEventListener('focus', runCallback);

  return () => {
    window.removeEventListener(PAYMENT_SYNC_EVENT, runCallback);
    window.removeEventListener('focus', runCallback);
  };
};
