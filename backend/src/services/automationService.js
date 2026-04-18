const pool = require('../config/db');
const { queueNotification } = require('./notificationService');

const getActiveTariff = async (conn = pool) => {
  const [rows] = await conn.query(
    `SELECT *
     FROM tariffs
     WHERE is_active = 1
     ORDER BY effective_from DESC, id DESC
     LIMIT 1`
  );

  if (!rows.length) {
    throw new Error('No active tariff has been configured.');
  }

  return rows[0];
};

const applyAutomaticPenalties = async () => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const notificationsToSend = [];

    const tariff = await getActiveTariff(conn);
    const [eligibleBills] = await conn.query(
      `SELECT b.id, b.customer_id, b.bill_number, b.balance_due, b.due_date, b.status,
              c.full_name, c.email, c.phone, c.user_id
       FROM bills b
       INNER JOIN customers c ON c.id = b.customer_id
       LEFT JOIN penalties p ON p.bill_id = b.id
       WHERE b.balance_due > 0
         AND b.due_date < CURDATE()
         AND p.id IS NULL`
    );

    let appliedCount = 0;
    for (const bill of eligibleBills) {
      const balanceDue = Number(bill.balance_due);
      const penaltyAmount =
        tariff.penalty_type === 'fixed'
          ? Number(tariff.penalty_value)
          : Number(((balanceDue * Number(tariff.penalty_value)) / 100).toFixed(2));

      if (penaltyAmount <= 0) {
        await conn.query(`UPDATE bills SET status = 'overdue' WHERE id = ?`, [bill.id]);
        continue;
      }

      await conn.query(
        `INSERT INTO penalties
          (bill_id, customer_id, penalty_type, penalty_amount, reason, applied_date, status)
         VALUES (?, ?, ?, ?, ?, CURDATE(), 'active')`,
        [bill.id, bill.customer_id, tariff.penalty_type, penaltyAmount, 'Automatic overdue penalty applied after due date.']
      );

      await conn.query(
        `UPDATE bills
         SET penalty_amount = penalty_amount + ?,
             total_amount = total_amount + ?,
             balance_due = balance_due + ?,
             status = 'overdue'
         WHERE id = ?`,
        [penaltyAmount, penaltyAmount, penaltyAmount, bill.id]
      );

      notificationsToSend.push({
        userId: bill.user_id,
        customerId: bill.customer_id,
        type: 'payment_overdue',
        title: 'Payment overdue',
        message: `Bill ${bill.bill_number} is overdue. An automatic penalty of UGX ${penaltyAmount.toLocaleString()} has been added.`,
        recipientEmail: bill.email,
        recipientPhone: bill.phone,
      });

      appliedCount += 1;
    }

    await conn.commit();
    for (const notification of notificationsToSend) {
      await queueNotification(notification);
    }
    return appliedCount;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  getActiveTariff,
  applyAutomaticPenalties,
};
