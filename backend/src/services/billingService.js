const pool = require('../config/db');
const { getActiveTariff } = require('./automationService');
const { queueNotification } = require('./notificationService');

const buildBillNumber = (billingYear, billingMonth, customerId) =>
  `BILL-${billingYear}${String(billingMonth).padStart(2, '0')}-${String(customerId).padStart(4, '0')}`;

const generateBillFromConsumption = async ({ consumptionId, generatedBy }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [consumptionRows] = await conn.query(
      `SELECT cr.*, c.full_name, c.email, c.phone, c.user_id
       FROM consumption_records cr
       INNER JOIN customers c ON c.id = cr.customer_id
       WHERE cr.id = ?`,
      [consumptionId]
    );

    if (!consumptionRows.length) {
      throw new Error('Consumption record not found.');
    }

    const consumption = consumptionRows[0];

    const [existingBill] = await conn.query(
      `SELECT id FROM bills WHERE consumption_record_id = ?`,
      [consumptionId]
    );
    if (existingBill.length) {
      throw new Error('A bill has already been generated for this consumption record.');
    }

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

    const dueDateSql = `DATE_ADD(?, INTERVAL ${Number(tariff.due_days)} DAY)`;
    const [insertResult] = await conn.query(
      `INSERT INTO bills
        (bill_number, customer_id, consumption_record_id, tariff_id, billing_month, billing_year,
         units_consumed, rate_per_unit, fixed_charge, bill_amount, previous_balance,
         penalty_amount, total_amount, amount_paid, balance_due, due_date, status, generated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ${dueDateSql}, 'unpaid', ?)`,
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
        consumption.reading_date,
        generatedBy,
      ]
    );

    const [[bill]] = await conn.query(
      `SELECT id, bill_number, total_amount, balance_due, due_date, bill_amount, previous_balance
       FROM bills
       WHERE id = ?`,
      [insertResult.insertId]
    );

    await conn.commit();

    await queueNotification({
      userId: consumption.user_id,
      customerId: consumption.customer_id,
      type: 'bill_generated',
      title: 'Bill generated',
      message: `Bill ${bill.bill_number} for UGX ${Number(bill.total_amount).toLocaleString()} has been generated and is due on ${bill.due_date}.`,
      recipientEmail: consumption.email,
      recipientPhone: consumption.phone,
    });

    return bill;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  generateBillFromConsumption,
};
