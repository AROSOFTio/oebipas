const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const consumptionRoutes = require('./routes/consumptionRoutes');
const billRoutes = require('./routes/billRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tariffRoutes = require('./routes/tariffRoutes');
const userRoutes = require('./routes/userRoutes');
const { applyAutomaticPenalties } = require('./services/automationService');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/consumption', consumptionRoutes);
app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/penalties', penaltyRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/tariffs', tariffRoutes);
app.use('/api/v1/users', userRoutes);

setInterval(() => {
  applyAutomaticPenalties().catch(error => {
    console.error('Automatic penalty job failed:', error.message);
  });
}, 60 * 60 * 1000);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error.',
  });
});

module.exports = app;
