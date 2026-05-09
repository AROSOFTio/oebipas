const test = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
const pool = require('../src/config/db');

const servicePath = require.resolve('../src/services/notificationService');
const africasTalkingPath = require.resolve('africastalking');
const originalPoolQuery = pool.query;
const originalAfricasTalking = require(africasTalkingPath);
const originalEnv = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  AFRICASTALKING_USERNAME: process.env.AFRICASTALKING_USERNAME,
  AFRICASTALKING_API_KEY: process.env.AFRICASTALKING_API_KEY,
};

const loadNotificationService = ({ sendMail, sendSms, verify = async () => true }) => {
  process.env.SMTP_HOST = 'smtp.example.com';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'smtp-user';
  process.env.SMTP_PASS = 'smtp-pass';
  process.env.SMTP_FROM_EMAIL = 'no-reply@example.com';
  process.env.AFRICASTALKING_USERNAME = 'sandbox';
  process.env.AFRICASTALKING_API_KEY = 'api-key';

  delete require.cache[servicePath];
  require.cache[africasTalkingPath].exports = () => ({
    SMS: {
      send: sendSms,
    },
  });

  test.mock.method(nodemailer, 'createTransport', () => ({
    verify,
    sendMail,
  }));

  return require('../src/services/notificationService');
};

test.afterEach(() => {
  pool.query = originalPoolQuery;
  require.cache[africasTalkingPath].exports = originalAfricasTalking;
  delete require.cache[servicePath];
  test.mock.restoreAll();
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
});

test('queueNotification attempts SMS even when email fails', async () => {
  const records = [];
  const smsCalls = [];

  pool.query = async (sql, params) => {
    assert.match(sql, /INSERT INTO notifications/);
    records.push({
      channel: params[3],
      status: params[8],
    });
    return [{ insertId: records.length }];
  };

  const notificationService = loadNotificationService({
    sendMail: async () => {
      const error = new Error('SMTP rejected recipient');
      error.code = 'EENVELOPE';
      error.response = '550 mailbox unavailable';
      error.command = 'RCPT TO';
      throw error;
    },
    sendSms: async payload => {
      smsCalls.push(payload);
    },
  });

  const result = await notificationService.queueNotification({
    userId: 1,
    customerId: 2,
    type: 'bill_generated',
    title: 'Bill generated',
    message: 'Your bill is ready.',
    recipientEmail: 'customer@example.com',
    recipientPhone: '0700000000',
  });

  assert.equal(smsCalls.length, 1);
  assert.deepEqual(
    records.sort((a, b) => a.channel.localeCompare(b.channel)),
    [
      { channel: 'email', status: 'failed' },
      { channel: 'sms', status: 'sent' },
    ]
  );
  assert.equal(result.results.length, 2);
  assert.deepEqual(result.errors, ['email: SMTP rejected recipient']);
});

test('SMTP transport verification is cached after first success', async () => {
  let verifyCalls = 0;

  pool.query = async () => [{ insertId: 1 }];

  const notificationService = loadNotificationService({
    verify: async () => {
      verifyCalls += 1;
      return true;
    },
    sendMail: async () => {},
    sendSms: async () => {},
  });

  await notificationService.queueNotification({
    type: 'manual',
    title: 'One',
    message: 'First email',
    recipientEmail: 'first@example.com',
  });

  await notificationService.queueNotification({
    type: 'manual',
    title: 'Two',
    message: 'Second email',
    recipientEmail: 'second@example.com',
  });

  assert.equal(verifyCalls, 1);
});
