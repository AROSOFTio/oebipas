const pool = require('../config/db');
const nodemailer = require('nodemailer');
const AfricasTalking = require('africastalking');

let emailTransporter = null;
let smsClient = null;

const getEmailTransporter = () => {
  if (emailTransporter) return emailTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_FROM_NAME } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM_EMAIL.');
  }

  emailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  emailTransporter.defaultFrom = `"${SMTP_FROM_NAME || 'UEDCL OEBIPAS'}" <${SMTP_FROM_EMAIL}>`;
  return emailTransporter;
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

const sendEmail = async ({ recipientEmail, title, message }) => {
  const transporter = getEmailTransporter();
  await transporter.sendMail({
    from: transporter.defaultFrom,
    to: recipientEmail,
    subject: title,
    text: message,
    html: `<p>${message.replace(/\n/g, '<br />')}</p>`,
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
  recipientEmail = null,
  recipientPhone = null,
}) => {
  const results = [];
  const errors = [];

  if (recipientEmail) {
    try {
      await sendEmail({ recipientEmail, title, message });
      results.push(
        await createNotificationRecord({
          userId,
          customerId,
          type,
          title,
          message,
          channel: 'email',
          recipientEmail,
          recipientPhone,
          status: 'sent',
        })
      );
    } catch (error) {
      errors.push(`email: ${error.message}`);
      results.push(
        await createNotificationRecord({
          userId,
          customerId,
          type,
          title,
          message,
          channel: 'email',
          recipientEmail,
          recipientPhone,
          status: 'failed',
        })
      );
    }
  }

  if (recipientPhone) {
    try {
      await sendSms({ recipientPhone, message });
      results.push(
        await createNotificationRecord({
          userId,
          customerId,
          type,
          title,
          message,
          channel: 'sms',
          recipientEmail,
          recipientPhone,
          status: 'sent',
        })
      );
    } catch (error) {
      errors.push(`sms: ${error.message}`);
      results.push(
        await createNotificationRecord({
          userId,
          customerId,
          type,
          title,
          message,
          channel: 'sms',
          recipientEmail,
          recipientPhone,
          status: 'failed',
        })
      );
    }
  }

  return { results, errors };
};

module.exports = {
  queueNotification,
};
