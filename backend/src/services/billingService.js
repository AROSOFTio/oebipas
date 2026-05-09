const pool = require('../config/db');
const { getActiveTariff } = require('./automationService');
const notificationService = require('./notificationService');
const documentService = require('./documentService');

const buildBillNumber = (billingYear, billingMonth, customerId) =>
  `BILL-${billingYear}${String(billingMonth).padStart(2, '0')}-${String(customerId).padStart(4, '0')}`;

const summarizeError = error => (
  error
    ? {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        stack: error.stack,
      }
    : {}
);

const isDuplicateBillError = error => error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062;

const addDaysToDateString = (value, days) => {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
  const year = value instanceof Date ? date.getFullYear() : date.getUTCFullYear();
  const month = value instanceof Date ? date.getMonth() : date.getUTCMonth();
  const day = value instanceof Date ? date.getDate() : date.getUTCDate();
  const dueDate = new Date(Date.UTC(year, month, day));
  dueDate.setUTCDate(dueDate.getUTCDate() + Number(days));
  return dueDate.toISOString().slice(0, 10);
};

const sendBillGeneratedNotification = async ({ consumption, bill }) => {
  const invoicePdf = await documentService.createInvoicePdfBuffer({
    bill,
    customer: consumption,
  });

  const dueDateText = new Date(bill.due_date).toLocaleString('en-US', { timeZone: 'Africa/Kampala', weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/,/g, '');

  const result = await notificationService.queueNotification({
    userId: consumption.user_id,
    customerId: consumption.customer_id,
    type: 'bill_generated',
    title: 'Bill generated',
    message: `Dear ${consumption.full_name},\n\nBill ${bill.bill_number} for UGX ${Number(bill.total_amount).toLocaleString()} has been generated and is due on ${dueDateText} GMT+0300 (East Africa Time). Your PDF invoice is attached.`,
    smsMessage: `Bill ${bill.bill_number} for UGX ${Number(bill.total_amount).toLocaleString()} has been generated and is due on ${dueDateText} GMT+0300 (East Africa Time).`,
    attachments: [
      {
        filename: `${bill.bill_number}.pdf`,
        content: invoicePdf,
        contentType: 'application/pdf',
      },
    ],
    recipientEmail: consumption.email,
    recipientPhone: consumption.phone,
  });

  if (result.errors.length) {
    console.warn(`[Billing] Bill ${bill.bill_number} notification completed with errors: ${result.errors.join('; ')}`);
  }

  return result;
};

const logBillNotificationFailure = ({ consumption, bill, error, errors = [] }) => {
  console.error('[Billing] Background bill notification failed', {
    billNumber: bill?.bill_number,
    customerId: consumption?.customer_id,
    customerEmail: consumption?.email,
    errors,
    ...summarizeError(error),
  });
};

const dispatchBillGeneratedNotification = ({ consumption, bill }) => {
  setImmediate(() => {
    sendBillGeneratedNotification({ consumption, bill })
      .then(result => {
        if (result?.errors?.length) {
          logBillNotificationFailure({ consumption, bill, errors: result.errors });
        }
      })
      .catch(error => {
        logBillNotificationFailure({ consumption, bill, error });
      });
  });
};

const generateBillFromConsumption = async ({ consumptionId, generatedBy }) => {
  const conn = await pool.getConnection();
  let committed = false;

  try {
    await conn.beginTransaction();

    const [consumptionRows] = await conn.query(
      `SELECT cr.*, c.full_name, c.email, c.phone, c.user_id, c.customer_number, c.meter_number
       FROM consumption_records cr
       INNER JOIN customers c ON c.id = cr.customer_id
       WHERE cr.id = ?`,
      [consumptionId]
    );

    if (!consumptionRows.length) {
      throw new Error('Consumption record not found.');
    }

    const consumption = consumptionRows[0];

    const tariff = await getActiveTariff(conn);
    const units = Number(consumption.units_consumed);
    const billAmount = Number((units * Number(tariff.rate_per_unit) + Number(tariff.fixed_charge)).toFixed(2));

    const [[previousBill]] = await conn.query(
      `SELECT COALESCE(SUM(balance_due), 0) AS previous_balance
       FROM bills
       WHERE customer_id = ?
         AND balance_due > 0
         AND (billing_year < ? OR (billing_year = ? AND billing_month < ?))`,
      [consumption.customer_id, consumption.billing_year, consumption.billing_year, consumption.billing_month]
    );

    const previousBalance = Number(previousBill?.previous_balance || 0);
    const totalAmount = Number((billAmount + previousBalance).toFixed(2));
    const billNumber = buildBillNumber(consumption.billing_year, consumption.billing_month, consumption.customer_id);
    const dueDate = addDaysToDateString(consumption.reading_date, tariff.due_days);

    let insertResult;
    try {
      [insertResult] = await conn.query(
        `INSERT INTO bills
          (bill_number, customer_id, consumption_record_id, tariff_id, billing_month, billing_year,
           units_consumed, rate_per_unit, fixed_charge, bill_amount, previous_balance,
           penalty_amount, total_amount, amount_paid, balance_due, due_date, status, generated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?, 'unpaid', ?)`,
        [
          billNumber,
          consumption.customer_id,
          consumption.id,
          tariff.id,
          consumption.billing_month,
          consumption.billing_year,
          units,
          tariff.rate_per_unit,
          tariff.fixed_charge,
          billAmount,
          previousBalance,
          totalAmount,
          totalAmount,
          dueDate,
          generatedBy,
        ]
      );
    } catch (error) {
      if (isDuplicateBillError(error)) {
        throw new Error('A bill has already been generated for this consumption record.');
      }
      throw error;
    }

    const bill = {
      id: insertResult.insertId,
      bill_number: billNumber,
      billing_month: consumption.billing_month,
      billing_year: consumption.billing_year,
      units_consumed: units,
      rate_per_unit: tariff.rate_per_unit,
      fixed_charge: tariff.fixed_charge,
      total_amount: totalAmount,
      balance_due: totalAmount,
      due_date: dueDate,
      bill_amount: billAmount,
      previous_balance: previousBalance,
      status: 'unpaid',
    };

    await conn.commit();
    committed = true;

    dispatchBillGeneratedNotification({ consumption, bill });

    return bill;
  } catch (error) {
    if (!committed) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  dispatchBillGeneratedNotification,
  generateBillFromConsumption,
  sendBillGeneratedNotification,
};
