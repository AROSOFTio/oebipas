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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Find all unpaid/partially_paid bills (we check if balance > threshold)
    // We only apply if NOT already penalized (or we can apply once per month, but user says "Autoapplied")
    const [eligibleBills] = await conn.query(`
      SELECT b.id, b.customer_id, b.balance_due, b.due_date, c.category, c.full_name as customer_name
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.status IN ('unpaid', 'partially_paid', 'overdue')
      AND b.id NOT IN (SELECT bill_id FROM penalties WHERE status = 'active' AND applied_date > DATE_SUB(NOW(), INTERVAL 30 DAY))
    `);

    let appliedCount = 0;

    for (const bill of eligibleBills) {
      let shouldApply = false;
      const daysOverdue = Math.floor((today - new Date(bill.due_date)) / (1000 * 60 * 60 * 24));
      
      const category = bill.category.toLowerCase();
      const balance = parseFloat(bill.balance_due);

      if (category === 'residential' && balance >= 100000 && daysOverdue > 7) {
        shouldApply = true;
      } else if (category === 'commercial' && balance >= 250000 && daysOverdue > 14) {
        shouldApply = true;
      } else if (category === 'industrial' && balance >= 1500000 && daysOverdue > 30) {
        shouldApply = true;
      }

      if (shouldApply) {
        // Get tariff for penalty calculation
        const [tariffRows] = await conn.query(
          'SELECT penalty_type, penalty_value FROM tariff_rules WHERE customer_category = ? AND status = "active" ORDER BY effective_from DESC LIMIT 1',
          [bill.category]
        );

        if (tariffRows.length > 0) {
          const tariff = tariffRows[0];
          let penaltyAmount = (tariff.penalty_type === 'fixed') 
            ? parseFloat(tariff.penalty_value) 
            : parseFloat((balance * parseFloat(tariff.penalty_value) / 100).toFixed(2));

          if (penaltyAmount > 0) {
            await conn.query(
              `INSERT INTO penalties (bill_id, customer_id, penalty_type, penalty_amount, reason, applied_date, status)
               VALUES (?, ?, ?, ?, ?, ?, 'active')`,
              [bill.id, bill.customer_id, tariff.penalty_type, penaltyAmount, `Auto-applied penalty for ${bill.category} (Overdue ${daysOverdue} days)`, todayStr]
            );

            await conn.query(
              `UPDATE bills SET penalty_amount = penalty_amount + ?, total_amount = total_amount + ?, balance_due = balance_due + ?, status = 'overdue' WHERE id = ?`,
              [penaltyAmount, penaltyAmount, penaltyAmount, bill.id]
            );
            appliedCount++;
          }
        }
      }
    }

    await conn.commit();
    if (appliedCount > 0) {
      const actorId = req.user ? req.user.id : 1; // 1 = System/Admin if automated
      await logAudit(actorId, 'AUTO_APPLY_PENALTIES', 'Penalties', null, `System applied ${appliedCount} automated late payment penalties.`);
    }

    if (res) {
      res.status(200).json({ success: true, message: `Successfully processed automation. Applied ${appliedCount} penalties.` });
    }
    return appliedCount;
  } catch (error) {
    await conn.rollback();
    console.error('Penalty Engine Error:', error);
    if (res) res.status(500).json({ success: false, message: 'Internal server error while applying penalties' });
    throw error;
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
