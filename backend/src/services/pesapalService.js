const DEFAULT_BASE_URL = 'https://pay.pesapal.com/v3';
const DEFAULT_SANDBOX_URL = 'https://cybqa.pesapal.com/pesapalv3';

let cachedIpn = null;

const getBaseUrl = () => {
  if (process.env.PESAPAL_BASE_URL) {
    return process.env.PESAPAL_BASE_URL.replace(/\/$/, '');
  }

  return process.env.PESAPAL_ENV === 'sandbox' ? DEFAULT_SANDBOX_URL : DEFAULT_BASE_URL;
};

const getRequiredConfig = () => {
  const config = {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY,
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    backendPublicUrl: process.env.BACKEND_PUBLIC_URL || process.env.FRONTEND_URL,
  };

  if (!config.consumerKey || !config.consumerSecret || !config.frontendUrl || !config.backendPublicUrl) {
    throw new Error('Pesapal configuration is incomplete. Set PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, FRONTEND_URL and BACKEND_PUBLIC_URL.');
  }

  return config;
};

const pesapalRequest = async (path, options = {}) => {
  const response = await fetch(`${getBaseUrl()}${path}`, options);
  const text = await response.text();

  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Pesapal returned a non-JSON response: ${text}`);
  }

  if (!response.ok || payload.error) {
    const message = payload?.error?.message || payload?.message || `Pesapal request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

const getAccessToken = async () => {
  const { consumerKey, consumerSecret } = getRequiredConfig();

  const payload = await pesapalRequest('/api/Auth/RequestToken', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  return payload.token;
};

const registerIpnUrl = async () => {
  if (cachedIpn?.url === `${getRequiredConfig().backendPublicUrl}/api/v1/payments/ipn`) {
    return cachedIpn.ipn_id;
  }

  const token = await getAccessToken();
  const { backendPublicUrl } = getRequiredConfig();
  const url = `${backendPublicUrl.replace(/\/$/, '')}/api/v1/payments/ipn`;

  const payload = await pesapalRequest('/api/URLSetup/RegisterIPN', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url,
      ipn_notification_type: 'POST',
    }),
  });

  cachedIpn = {
    url,
    ipn_id: payload.ipn_id || payload.ipnId || payload.notification_id,
  };

  if (!cachedIpn.ipn_id) {
    throw new Error('Pesapal did not return an IPN identifier.');
  }

  return cachedIpn.ipn_id;
};

const splitName = fullName => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Customer';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'UEDCL';
  return { firstName, lastName };
};

const submitOrderRequest = async ({ merchantReference, amount, description, customer }) => {
  const token = await getAccessToken();
  const notificationId = await registerIpnUrl();
  const { frontendUrl } = getRequiredConfig();
  const { firstName, lastName } = splitName(customer.full_name);

  const payload = await pesapalRequest('/api/Transactions/SubmitOrderRequest', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: merchantReference,
      currency: process.env.PESAPAL_CURRENCY || 'UGX',
      amount: Number(amount),
      description,
      callback_url: `${frontendUrl.replace(/\/$/, '')}/customer/payments/return`,
      cancellation_url: `${frontendUrl.replace(/\/$/, '')}/customer/pay`,
      notification_id: notificationId,
      branch: 'UEDCL Branch',
      redirect_mode: 'TOP_WINDOW',
      billing_address: {
        email_address: customer.email,
        phone_number: customer.phone || '',
        country_code: process.env.PESAPAL_COUNTRY_CODE || 'UG',
        first_name: firstName,
        middle_name: '',
        last_name: lastName,
        line_1: customer.address || 'UEDCL Customer Address',
        line_2: '',
        city: 'Kampala',
        state: '',
        postal_code: '',
        zip_code: '',
      },
    }),
  });

  return {
    orderTrackingId: payload.order_tracking_id,
    merchantReference: payload.merchant_reference,
    redirectUrl: payload.redirect_url,
  };
};

const getTransactionStatus = async orderTrackingId => {
  const token = await getAccessToken();

  return pesapalRequest(`/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

module.exports = {
  submitOrderRequest,
  getTransactionStatus,
};
