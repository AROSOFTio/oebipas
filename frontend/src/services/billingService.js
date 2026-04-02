import { apiRequest } from './api';

export function fetchBills(query = {}) {
  const params = new URLSearchParams(query);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/bills${suffix}`);
}

export function fetchBill(billId) {
  return apiRequest(`/bills/${billId}`);
}

export function generateBills(payload) {
  return apiRequest('/bills/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function initiatePesapalPayment(billId) {
  return apiRequest(`/bills/${billId}/pay/pesapal`, {
    method: 'POST',
  });
}
