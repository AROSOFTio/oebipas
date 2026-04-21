require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } = process.env;

console.log(`Testing SMTP Connection...`);
console.log(`Host: ${SMTP_HOST}\nPort: ${SMTP_PORT}\nUser: ${SMTP_USER}\nSecure: ${process.env.SMTP_SECURE}`);

const emailTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    // First verify the connection configuration
    console.log('\nVerifying configuration...');
    await emailTransporter.verify();
    console.log('Configuration verified successfully! Server is ready to take our messages.');
    
    // Send a test email
    console.log('\nSending test email...');
    let info = await emailTransporter.sendMail({
      from: `"OEBIPAS System" <${SMTP_FROM_EMAIL}>`,
      to: SMTP_USER, // sending an email to itself for testing
      subject: "SMTP Test from Backend",
      text: "If you are reading this, the mail notification system is fixed and working properly over Contabo!",
    });
    console.log("Message sent successfully!");
    console.log("Message ID: %s", info.messageId);
  } catch (error) {
    console.error("\nERROR! Failed to send email:");
    console.error(error);
  }
}

testConnection();
