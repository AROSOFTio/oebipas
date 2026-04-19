const test = require('node:test');
const assert = require('node:assert/strict');

const pool = require('../src/config/db');
const notificationService = require('../src/services/notificationService');
const pesapalService = require('../src/services/pesapalService');
const paymentSettlementService = require('../src/services/paymentSettlementService');

const originalPoolQuery = pool.query;
const originalGetConnection = pool.getConnection;
const originalQueueNotification = notificationService.queueNotification;
const originalGetTransactionStatus = pesapalService.getTransactionStatus;

test.afterEach(() => {
  pool.query = originalPoolQuery;
  pool.getConnection = originalGetConnection;
  notificationService.queueNotification = originalQueueNotification;
  pesapalService.getTransactionStatus = originalGetTransactionStatus;
});

test('normalizePesapalStatus maps documented Pesapal states correctly', () => {
  assert.equal(
    paymentSettlementService.normalizePesapalStatus({
      payment_status_description: 'COMPLETED',
      status_code: 1,
    }),
    'successful'
  );
  assert.equal(
    paymentSettlementService.normalizePesapalStatus({
      payment_status_description: 'FAILED',
      status_code: 2,
    }),
    'failed'
  );
  assert.equal(
    paymentSettlementService.normalizePesapalStatus({
      payment_status_description: 'REVERSED',
      status_code: 3,
    }),
    'failed'
  );
  assert.equal(
    paymentSettlementService.normalizePesapalStatus({
      payment_status_description: 'PENDING',
      status_code: '',
    }),
    'pending'
  );
});

test('verifyAndPersistPayment settles the bill and stays idempotent on duplicate callbacks', async () => {
  const state = {
    payment: {
      id: 7,
      payment_reference: 'PAY-123',
      bill_id: 11,
      customer_id: 3,
      amount: 500,
      status: 'pending',
      callback_status: 'pending',
      order_tracking_id: 'TRACK-123',
      transaction_reference: 'PESAPAL-123',
      confirmation_code: null,
    },
    bill: {
      id: 11,
      bill_number: 'BILL-203604-0001',
      balance_due: 500,
      amount_paid: 0,
      total_amount: 500,
      due_date: '2026-05-03',
      status: 'unpaid',
    },
  };
  const queuedNotifications = [];
  const internalNotifications = [];

  pool.query = async (sql, params) => {
    if (sql.includes('SELECT id') && sql.includes('FROM payments')) {
      assert.equal(params[0], state.payment.order_tracking_id);
      return [[{ id: state.payment.id }]];
    }

    if (sql.includes('SELECT u.id') && sql.includes('FROM users u')) {
      return [[{ id: 42 }]];
    }

    if (sql.includes('INSERT INTO notifications')) {
      internalNotifications.push(params);
      return [{ affectedRows: 1 }];
    }

    throw new Error(`Unhandled pool.query SQL in test: ${sql}`);
  };

  pool.getConnection = async () => ({
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    query: async (sql, params) => {
      if (sql.includes('FROM payments p')) {
        return [[{
          ...state.payment,
          user_id: 19,
          email: 'customer@example.com',
          phone: '0700000000',
          bill_number: state.bill.bill_number,
          balance_due: state.bill.balance_due,
          amount_paid: state.bill.amount_paid,
          total_amount: state.bill.total_amount,
          due_date: state.bill.due_date,
          customer_id: state.payment.customer_id,
          bill_status: state.bill.status,
        }]];
      }

      if (sql.includes('UPDATE payments') && sql.includes("status = 'successful'")) {
        state.payment.status = 'successful';
        state.payment.callback_status = 'received';
        state.payment.order_tracking_id = params[0] || state.payment.order_tracking_id;
        state.payment.confirmation_code = params[1] || state.payment.confirmation_code;
        return [{ affectedRows: 1 }];
      }

      if (sql.includes('UPDATE bills')) {
        state.bill.amount_paid += Number(params[0]);
        state.bill.balance_due = Number(params[1]);
        state.bill.status = params[2];
        return [{ affectedRows: 1 }];
      }

      if (sql.includes('UPDATE penalties')) {
        return [{ affectedRows: 0 }];
      }

      if (sql.includes('SET callback_status = \'received\'')) {
        state.payment.callback_status = 'received';
        return [{ affectedRows: 1 }];
      }

      throw new Error(`Unhandled connection SQL in test: ${sql}`);
    },
  });

  notificationService.queueNotification = async payload => {
    queuedNotifications.push(payload);
  };

  pesapalService.getTransactionStatus = async trackingId => ({
    merchant_reference: state.payment.transaction_reference,
    payment_status_description: 'COMPLETED',
    status_code: 1,
    amount: 500,
    confirmation_code: 'CNF-1',
    message: 'Request processed successfully',
    order_tracking_id: trackingId,
  });

  const firstResult = await paymentSettlementService.verifyAndPersistPayment(
    state.payment.order_tracking_id,
    state.payment.transaction_reference
  );

  assert.equal(firstResult.payment_status, 'successful');
  assert.equal(firstResult.bill_status, 'paid');
  assert.equal(firstResult.bill_balance_due, 0);
  assert.equal(state.payment.status, 'successful');
  assert.equal(state.bill.balance_due, 0);
  assert.equal(state.bill.amount_paid, 500);
  assert.equal(state.bill.status, 'paid');
  assert.equal(queuedNotifications.length, 1);
  assert.match(queuedNotifications[0].title, /Payment receipt/i);
  assert.match(queuedNotifications[0].message, /Bill number:/i);
  assert.match(queuedNotifications[0].html, /Payment Receipt/i);
  assert.equal(internalNotifications.length, 1);

  const duplicateResult = await paymentSettlementService.verifyAndPersistPayment(
    state.payment.order_tracking_id,
    state.payment.transaction_reference
  );

  assert.equal(duplicateResult.payment_status, 'successful');
  assert.equal(duplicateResult.duplicate, true);
  assert.equal(state.bill.amount_paid, 500);
  assert.equal(state.bill.balance_due, 0);
  assert.equal(queuedNotifications.length, 1);
  assert.equal(internalNotifications.length, 1);
});
