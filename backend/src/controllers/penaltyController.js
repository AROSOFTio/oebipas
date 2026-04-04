const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

exports.getAllPenalties = async (req, res) => {
  try {
    const [penalties] = await pool.query(`
      SELECT p.*, b.bill_number, c.customer_number, c.full_name as customer_name
      FROM penalties p
      JOIN bills b ON p.bill_id = b.id
      JOIN customers c ON p.customer_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.status(200).json({ success: true, data: penalties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getCustomerPenalties = async (req, res) => {
  const { id } = req.params;
  try {
    const [penalties] = await pool.query(`
      SELECT p.*, b.bill_number
      FROM penalties p
      JOIN bills b ON p.bill_id = b.id
      WHERE p.customer_id = ?
      ORDER BY p.created_at DESC
    `, [id]);
    res.status(200).json({ success: true, data: penalties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.applyBulkPenalties = async (req, res) => {
  // Logic to apply penalties to all overdue bills
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const today = new Date().toISOString().split('T')[0];

    // Find all overdue bills without an active penalty
    const [overdueBills] = await conn.query(`
      SELECT b.id, b.customer_id, b.balance_due, b.due_date, c.category
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.status = 'unpaid' AND b.due_date < ? 
      AND b.id NOT IN (SELECT bill_id FROM penalties WHERE status = 'active')
    `, [today]);

    let appliedCount = 0;

    for (const bill of overdueBills) {
      // Get tariff rules for category
      const [tariffRows] = await conn.query(
        'SELECT penalty_type, penalty_value FROM tariff_rules WHERE customer_category = ? AND status = "active" ORDER BY effective_from DESC LIMIT 1',
        [bill.category]
      );

      if (tariffRows.length > 0) {
        const tariff = tariffRows[0];
        let penaltyAmount = 0;

        if (tariff.penalty_type === 'fixed') {
          penaltyAmount = parseFloat(tariff.penalty_value);
        } else {
          penaltyAmount = parseFloat((bill.balance_due * parseFloat(tariff.penalty_value) / 100).toFixed(2));
        }

        if (penaltyAmount > 0) {
          // Insert penalty
          await conn.query(
            `INSERT INTO penalties (bill_id, customer_id, penalty_type, penalty_amount, reason, applied_date, status)
             VALUES (?, ?, ?, ?, ?, ?, 'active')`,
            [bill.id, bill.customer_id, tariff.penalty_type, penaltyAmount, 'Late payment fee', today]
          );

          // Update bill status to overdue and increment balance_due & penalty_amount slightly if we want it embedded, 
          // but our schema has penalty_amount in the bill generation. Let's add it to total_amount & balance_due.
          await conn.query(
            `UPDATE bills SET penalty_amount = penalty_amount + ?, total_amount = total_amount + ?, balance_due = balance_due + ?, status = 'overdue' WHERE id = ?`,
            [penaltyAmount, penaltyAmount, penaltyAmount, bill.id]
          );
          appliedCount++;
        }
      }
    }

    await conn.commit();

    if (appliedCount > 0) {
      await logAudit(req.user.id, 'APPLY_PENALTIES', 'Penalties', null, `Applied ${appliedCount} late payment penalties.`);
    }

    res.status(200).json({ success: true, message: `Successfully applied ${appliedCount} penalties.` });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error while applying penalties' });
  } finally {
    conn.release();
  }
};

exports.waivePenalty = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [penalties] = await conn.query('SELECT * FROM penalties WHERE id = ?', [id]);
    if (penalties.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Penalty not found' });
    }

    const penalty = penalties[0];
    if (penalty.status !== 'active') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Penalty is not active' });
    }

    // Mark penalty as waived
    await conn.query('UPDATE penalties SET status = "waived" WHERE id = ?', [id]);

    // Reverse the penalty amount from the bill
    await conn.query(
      `UPDATE bills SET penalty_amount = penalty_amount - ?, total_amount = total_amount - ?, balance_due = balance_due - ? WHERE id = ?`,
      [penalty.penalty_amount, penalty.penalty_amount, penalty.penalty_amount, penalty.bill_id]
    );

    // Also flip status back to unpaid if it was overdue due to this? Complex, leave as overdue or change if balance > 0
    await conn.commit();
    await logAudit(req.user.id, 'WAIVE_PENALTY', 'Penalties', id, `Waived penalty of UGX ${penalty.penalty_amount}`);

    res.status(200).json({ success: true, message: 'Penalty waived successfully' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error while waiving penalty' });
  } finally {
    conn.release();
  }
};
