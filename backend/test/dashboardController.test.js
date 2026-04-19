const test = require('node:test');
const assert = require('node:assert/strict');

const pool = require('../src/config/db');
const automationService = require('../src/services/automationService');
const paymentSettlementService = require('../src/services/paymentSettlementService');
const dashboardController = require('../src/controllers/dashboardController');

const originalPoolQuery = pool.query;
const originalApplyAutomaticPenalties = automationService.applyAutomaticPenalties;
const originalReconcilePendingPayments = paymentSettlementService.reconcilePendingPayments;

test.afterEach(() => {
  pool.query = originalPoolQuery;
  automationService.applyAutomaticPenalties = originalApplyAutomaticPenalties;
  paymentSettlementService.reconcilePendingPayments = originalReconcilePendingPayments;
});

test('getDashboard returns customer-scoped summary for Electricity consumers', async () => {
  let reconcileArgs = null;

  automationService.applyAutomaticPenalties = async () => {};
  paymentSettlementService.reconcilePendingPayments = async args => {
    reconcileArgs = args;
    return 1;
  };

  pool.query = async (sql, params) => {
    if (sql.includes('SELECT COUNT(*) AS total_bills')) {
      assert.deepEqual(params, [7]);
      return [[{
        total_bills: 1,
        outstanding_balance: 0,
        total_paid_amount: 500,
        paid_bills: 1,
        pending_bills: 0,
      }]];
    }

    if (sql.includes('SELECT bill_number, total_amount, balance_due, status, due_date')) {
      return [[{
        bill_number: 'BILL-203604-0001',
        total_amount: 500,
        balance_due: 0,
        status: 'paid',
        due_date: '2026-05-03',
      }]];
    }

    if (sql.includes('SELECT payment_reference, amount, status, payment_date')) {
      return [[{
        payment_reference: 'PAY-123',
        amount: 500,
        status: 'successful',
        payment_date: '2026-04-19T11:30:00.000Z',
      }]];
    }

    if (sql.includes('SELECT title, message, status, created_at')) {
      return [[{
        title: 'Payment confirmed',
        message: 'Payment for bill BILL-203604-0001 was successful.',
        status: 'sent',
        created_at: '2026-04-19T11:31:00.000Z',
      }]];
    }

    throw new Error(`Unhandled dashboard SQL in test: ${sql}`);
  };

  const req = {
    user: {
      role: 'Electricity consumers',
      customer_id: 7,
    },
  };

  const response = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await dashboardController.getDashboard(req, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(reconcileArgs, { customerId: 7 });
  assert.equal(response.payload.success, true);
  assert.equal(response.payload.data.summary.total_bills, 1);
  assert.equal(response.payload.data.summary.outstanding_balance, 0);
  assert.equal(response.payload.data.summary.total_paid_amount, 500);
  assert.equal(response.payload.data.recentBills[0].status, 'paid');
  assert.equal(response.payload.data.recentPayments[0].status, 'successful');
  assert.equal(response.payload.data.notifications.length, 1);
});
