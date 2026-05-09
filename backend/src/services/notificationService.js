const pool = require('../config/db');
const nodemailer = require('nodemailer');
const AfricasTalking = require('africastalking');

let emailTransporter = null;
let smsClient = null;
let smtpVerificationPromise = null;
let smtpVerificationStatus = 'pending';

const summarizeDeliveryError = error => ({
  message: error?.message,
  code: error?.code,
  response: error?.response,
  command: error?.command,
  stack: error?.stack,
});

const logEmailFailure = ({ recipientEmail, type, error }) => {
  console.error('[Notifications] Email delivery failed', {
    recipientEmail,
    type,
    ...summarizeDeliveryError(error),
  });
};

const getEmailTransporter = () => {
  if (emailTransporter) return emailTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_FROM_NAME } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM_EMAIL.');
  }

  emailTransporter = nodemailer.createTransport({
    pool: true,
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 3),
    maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 20000),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  emailTransporter.defaultFrom = `"${SMTP_FROM_NAME || 'UEDCL OEBIPAS'}" <${SMTP_FROM_EMAIL}>`;
  return emailTransporter;
};

const verifyEmailTransporter = async () => {
  if (smtpVerificationStatus === 'verified') return true;
  if (smtpVerificationStatus === 'failed') return false;
  if (smtpVerificationPromise) return smtpVerificationPromise;

  smtpVerificationPromise = (async () => {
    try {
      const transporter = getEmailTransporter();
      await transporter.verify();
      smtpVerificationStatus = 'verified';
      console.info('[Notifications] SMTP transport verified.');
      return true;
    } catch (error) {
      smtpVerificationStatus = 'failed';
      console.error('[Notifications] SMTP transport verification failed', summarizeDeliveryError(error));
      return false;
    } finally {
      smtpVerificationPromise = null;
    }
  })();

  return smtpVerificationPromise;
};

const getSmsService = () => {
  if (smsClient) return smsClient;

  const { AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY } = process.env;
  if (!AFRICASTALKING_USERNAME || !AFRICASTALKING_API_KEY) {
    throw new Error("Africa's Talking configuration is incomplete. Set AFRICASTALKING_USERNAME and AFRICASTALKING_API_KEY.");
  }

  smsClient = AfricasTalking({
    username: AFRICASTALKING_USERNAME,
    apiKey: AFRICASTALKING_API_KEY,
  }).SMS;

  return smsClient;
};

const createNotificationRecord = async ({
  userId = null,
  customerId = null,
  type,
  title,
  message,
  channel,
  recipientEmail = null,
  recipientPhone = null,
  status,
}) => {
  const [result] = await pool.query(
    `INSERT INTO notifications
      (user_id, customer_id, notification_type, channel, title, message, recipient_email, recipient_phone, status, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${status === 'sent' ? 'NOW()' : 'NULL'})`,
    [userId, customerId, type, channel, title, message, recipientEmail, recipientPhone, status]
  );

  return result.insertId;
};

const sendEmail = async ({ recipientEmail, title, message, html = null, attachments = [], type = 'unknown' }) => {
  const transporter = getEmailTransporter();
  await verifyEmailTransporter();
  await transporter.sendMail({
    from: transporter.defaultFrom,
    to: recipientEmail,
    subject: title,
    text: message,
    html: html || `<p>${message.replace(/\n/g, '<br />')}</p>`,
    attachments,
  });
};

const sendSms = async ({ recipientPhone, message }) => {
  const sms = getSmsService();
  await sms.send({
    to: [recipientPhone],
    message,
    from: process.env.AFRICASTALKING_SENDER_ID || undefined,
  });
};

const queueNotification = async ({
  userId = null,
  customerId = null,
  type,
  title,
  message,
  html = null,
  attachments = [],
  smsMessage = null,
  recipientEmail = null,
  recipientPhone = null,
}) => {
  const results = [];
  const errors = [];
  const tasks = [];

  if (recipientEmail) {
    tasks.push((async () => {
      try {
        await sendEmail({ recipientEmail, title, message, html, attachments, type });
        console.info(`[Notifications] Email sent to ${recipientEmail} for ${type} with ${attachments.length} attachment(s).`);
        return {
          channel: 'email',
          id: await createNotificationRecord({
            userId,
            customerId,
            type,
            title,
            message,
            channel: 'email',
            recipientEmail,
            recipientPhone,
            status: 'sent',
          }),
        };
      } catch (error) {
        logEmailFailure({ recipientEmail, type, error });
        return {
          channel: 'email',
          error: `email: ${error.message}`,
          id: await createNotificationRecord({
            userId,
            customerId,
            type,
            title,
            message,
            channel: 'email',
            recipientEmail,
            recipientPhone,
            status: 'failed',
          }),
        };
      }
    })());
  }

  if (recipientPhone) {
    tasks.push((async () => {
      const smsBody = smsMessage || message;
      try {
        await sendSms({ recipientPhone, message: smsBody });
        console.info(`[Notifications] SMS sent to ${recipientPhone} for ${type}.`);
        return {
          channel: 'sms',
          id: await createNotificationRecord({
            userId,
            customerId,
            type,
            title,
            message: smsBody,
            channel: 'sms',
            recipientEmail,
            recipientPhone,
            status: 'sent',
          }),
        };
      } catch (error) {
        console.error(`[Notifications] SMS failed for ${recipientPhone} (${type}):`, error.message);
        return {
          channel: 'sms',
          error: `sms: ${error.message}`,
          id: await createNotificationRecord({
            userId,
            customerId,
            type,
            title,
            message: smsBody,
            channel: 'sms',
            recipientEmail,
            recipientPhone,
            status: 'failed',
          }),
        };
      }
    })());
  }

  const settled = await Promise.allSettled(tasks);
  settled.forEach(result => {
    if (result.status === 'fulfilled') {
      results.push(result.value.id);
      if (result.value.error) errors.push(result.value.error);
      return;
    }

    errors.push(result.reason?.message || String(result.reason));
  });

  return { results, errors };
};

module.exports = {
  queueNotification,
  sendEmail,
  verifyEmailTransporter,
};
