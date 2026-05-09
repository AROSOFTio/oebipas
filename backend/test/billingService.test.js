const test = require('node:test');
const assert = require('node:assert/strict');

const pool = require('../src/config/db');
const automationService = require('../src/services/automationService');
const documentService = require('../src/services/documentService');
const notificationService = require('../src/services/notificationService');

const billingServicePath = require.resolve('../src/services/billingService');
const originalGetConnection = pool.getConnection;
const originalGetActiveTariff = automationService.getActiveTariff;
const originalCreateInvoicePdfBuffer = documentService.createInvoicePdfBuffer;
const originalQueueNotification = notificationService.queueNotification;

const loadBillingService = () => {
  delete require.cache[billingServicePath];
  return require('../src/services/billingService');
};

const flushImmediate = () => new Promise(resolve => setImmediate(resolve));

test.afterEach(() => {
  pool.getConnection = originalGetConnection;
  automationService.getActiveTariff = originalGetActiveTariff;
  documentService.createInvoicePdfBuffer = originalCreateInvoicePdfBuffer;
  notificationService.queueNotification = originalQueueNotification;
  delete require.cache[billingServicePath];
});

test('generateBillFromConsumption returns after commit and dispatches notification asynchronously', async () => {
  let committed = false;
  let released = false;
  const notificationPayloads = [];
  const sqlStatements = [];

  automationService.getActiveTariff = async () => ({
    id: 4,
    rate_per_unit: '850.00',
    fixed_charge: '5000.00',
    due_days: 14,
  });

  documentService.createInvoicePdfBuffer = async () => Buffer.from('%PDF');
  notificationService.queueNotification = async payload => {
    assert.equal(committed, true);
    notificationPayloads.push(payload);
    return { results: [99], errors: ['email: simulated SMTP failure'] };
  };

  pool.getConnection = async () => ({
    beginTransaction: async () => {},
    commit: async () => {
      committed = true;
    },
    rollback: async () => {
      throw new Error('rollback should not run');
    },
    release: () => {
      released = true;
    },
    query: async (sql, params) => {
      sqlStatements.push(sql);

      if (sql.includes('FROM consumption_records cr')) {
        assert.equal(params[0], 12);
        return [[{
          id: 12,
          customer_id: 7,
          user_id: 20,
          full_name: 'Test Customer',
          email: 'customer@example.com',
          phone: '0700000000',
          customer_number: 'C-7',
          meter_number: 'M-7',
          billing_month: 4,
          billing_year: 2026,
          units_consumed: '100.00',
          reading_date: '2026-04-30',
        }]];
      }

      if (sql.includes('SELECT COALESCE(SUM(balance_due), 0) AS previous_balance')) {
        return [[{ previous_balance: '2500.00' }]];
      }

      if (sql.includes('INSERT INTO bills')) {
        assert.equal(params[13], '2026-05-14');
        return [{ insertId: 55 }];
      }

      throw new Error(`Unexpected SQL: ${sql}`);
    },
  });

  const billingService = loadBillingService();
  const bill = await billingService.generateBillFromConsumption({
    consumptionId: 12,
    generatedBy: 2,
  });

  assert.equal(committed, true);
  assert.equal(released, true);
  assert.equal(notificationPayloads.length, 0);
  assert.equal(bill.id, 55);
  assert.equal(bill.bill_number, 'BILL-202604-0007');
  assert.equal(bill.total_amount, 92500);
  assert.equal(bill.due_date, '2026-05-14');
  assert.equal(sqlStatements.some(sql => sql.includes('SELECT id FROM bills WHERE consumption_record_id')), false);
  assert.equal(sqlStatements.some(sql => sql.includes('FROM bills') && sql.includes('WHERE id = ?')), false);

  await flushImmediate();
  assert.equal(notificationPayloads.length, 1);
  assert.equal(notificationPayloads[0].attachments[0].contentType, 'application/pdf');
});

test('duplicate bill insert returns the existing business error without pre-checking', async () => {
  let rolledBack = false;
  const sqlStatements = [];

  automationService.getActiveTariff = async () => ({
    id: 4,
    rate_per_unit: '850.00',
    fixed_charge: '5000.00',
    due_days: 14,
  });

  pool.getConnection = async () => ({
    beginTransaction: async () => {},
    commit: async () => {
      throw new Error('commit should not run');
    },
    rollback: async () => {
      rolledBack = true;
    },
    release: () => {},
    query: async sql => {
      sqlStatements.push(sql);

      if (sql.includes('FROM consumption_records cr')) {
        return [[{
          id: 12,
          customer_id: 7,
          billing_month: 4,
          billing_year: 2026,
          units_consumed: '100.00',
          reading_date: '2026-04-30',
        }]];
      }

      if (sql.includes('SELECT COALESCE(SUM(balance_due), 0) AS previous_balance')) {
        return [[{ previous_balance: '0.00' }]];
      }

      if (sql.includes('INSERT INTO bills')) {
        const error = new Error('Duplicate entry');
        error.code = 'ER_DUP_ENTRY';
        error.errno = 1062;
        throw error;
      }

      throw new Error(`Unexpected SQL: ${sql}`);
    },
  });

  const billingService = loadBillingService();

  await assert.rejects(
    () => billingService.generateBillFromConsumption({ consumptionId: 12, generatedBy: 2 }),
    /A bill has already been generated for this consumption record\./
  );

  assert.equal(rolledBack, true);
  assert.equal(sqlStatements.some(sql => sql.includes('SELECT id FROM bills WHERE consumption_record_id')), false);
});
