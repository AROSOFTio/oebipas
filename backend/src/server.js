require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');
const { ensureDemoAccounts } = require('./services/demoAccountService');
const { verifyEmailTransporter } = require('./services/notificationService');
const { repairRoleLabels } = require('./services/roleRepairService');

const PORT = process.env.PORT || 5000;

// Test DB Connection before starting the server
pool.getConnection()
  .then(async (connection) => {
    console.log('Successfully connected to the database.');
    connection.release();

    await repairRoleLabels();
    await ensureDemoAccounts();
    verifyEmailTransporter().catch(error => {
      console.error('[Notifications] SMTP startup verification failed:', error.message);
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  });
