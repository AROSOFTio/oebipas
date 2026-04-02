import { apiRequest } from './api';

export async function fetchSettings() {
  return await apiRequest('/settings', { method: 'GET' });
}

export async function saveSettings(settings) {
  return await apiRequest('/settings', {
    method: 'POST',
    body: JSON.stringify({ settings }),
  });
}
