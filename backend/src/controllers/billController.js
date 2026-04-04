const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

/**
 * BILL GENERATION ENGINE
 * 
 * Steps:
 * 1. Fetch the consumption record for the given billing month/year
 * 2. Find the applicable tariff rule for the customer's category
 * 3. Calculate Energy Charge = units_consumed × rate_per_unit
 * 4. Apply Service Charge (fixed monthly)
 * 5. Compute Tax = (energy_charge + service_charge) × tax_percent / 100
 * 6. Fetch previous unpaid balance
 * 7. Apply penalty if previous bill is overdue
 * 8. Total = energy_charge + service_charge + tax + penalty + previous_balance
 * 9. Set due date = reading_date + 14 days
 * 10. Store bill and itemized bill_items rows
 */

exports.generateBill = async (req, res) => {
  const { customer_id, meter_id, billing_month, billing_year } = req.body;
  if (!customer_id || !meter_id || !billing_month || !billing_year) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get consumption record
    const [consumptionRows] = await conn.query(
      'SELECT * FROM consumption_records WHERE customer_id = ? AND meter_id = ? AND billing_month = ? AND billing_year = ?',
      [customer_id, meter_id, billing_month, billing_year]
    );
    if (consumptionRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'No consumption record found for this period' });
    }
    const consumption = consumptionRows[0];

    // 2. Get customer category
    const [customerRows] = await conn.query('SELECT category FROM customers WHERE id = ?', [customer_id]);
    if (customerRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const { category } = customerRows[0];

    // 3. Get active tariff for category
    const [tariffRows] = await conn.query(
      'SELECT * FROM tariff_rules WHERE customer_category = ? AND status = "active" ORDER BY effective_from DESC LIMIT 1',
      [category]
    );
    if (tariffRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: `No active tariff found for ${category} customers` });
    }
    const tariff = tariffRows[0];

    // 4. Calculate charges
    const units = parseFloat(consumption.units_consumed);
    const energyCharge = parseFloat((units * parseFloat(tariff.rate_per_unit)).toFixed(2));
    const serviceCharge = parseFloat(tariff.service_charge);
    const taxAmount = parseFloat(((energyCharge + serviceCharge) * parseFloat(tariff.tax_percent) / 100).toFixed(2));

    // 5. Get previous balance (last unpaid/overdue bill)
    const [prevBills] = await conn.query(
      'SELECT balance_due FROM bills WHERE customer_id = ? AND status IN ("unpaid", "overdue", "partially_paid") AND (billing_year < ? OR (billing_year = ? AND billing_month < ?)) ORDER BY billing_year DESC, billing_month DESC LIMIT 1',
      [customer_id, billing_year, billing_year, billing_month]
    );
    const previousBalance = prevBills.length > 0 ? parseFloat(prevBills[0].balance_due) : 0;

    // 6. Calculate penalty on previous balance
    let penaltyAmount = 0;
    if (previousBalance > 0) {
      if (tariff.penalty_type === 'fixed') {
        penaltyAmount = parseFloat(tariff.penalty_value);
      } else {
        penaltyAmount = parseFloat((previousBalance * parseFloat(tariff.penalty_value) / 100).toFixed(2));
      }
    }

    // 7. Total
    const totalAmount = parseFloat((energyCharge + serviceCharge + taxAmount + penaltyAmount + previousBalance).toFixed(2));

    // 8. Due date = 14 days from reading date
    const readingDate = new Date(consumption.reading_date);
    const dueDate = new Date(readingDate);
    dueDate.setDate(dueDate.getDate() + 14);

    // 9. Generate bill number
    const billNumber = `BILL-${billing_year}${String(billing_month).padStart(2, '0')}-${String(customer_id).padStart(5, '0')}`;

    // 10. Check if bill already exists
    const [existingBill] = await conn.query('SELECT id FROM bills WHERE bill_number = ?', [billNumber]);
    if (existingBill.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Bill already generated for this period' });
    }

    // 11. Insert bill
    const [billResult] = await conn.query(
      `INSERT INTO bills (bill_number, customer_id, meter_id, billing_month, billing_year, units_consumed, energy_charge, service_charge, tax_amount, penalty_amount, previous_balance, total_amount, balance_due, due_date, status, generated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?)`,
      [billNumber, customer_id, meter_id, billing_month, billing_year, units, energyCharge, serviceCharge, taxAmount, penaltyAmount, previousBalance, totalAmount, totalAmount, dueDate.toISOString().split('T')[0], req.user.id]
    );
    const billId = billResult.insertId;

    // 12. Insert itemized bill_items
    const items = [
      [billId, 'Units Consumed', 'consumption', units],
      [billId, 'Energy Charge', 'energy', energyCharge],
      [billId, 'Service Charge', 'service', serviceCharge],
      [billId, 'Tax / VAT', 'tax', taxAmount],
      [billId, 'Previous Balance', 'balance', previousBalance],
      [billId, 'Late Payment Penalty', 'penalty', penaltyAmount],
      [billId, 'Total Payable', 'total', totalAmount],
    ];
    for (const item of items) {
      await conn.query('INSERT INTO bill_items (bill_id, item_name, item_type, amount) VALUES (?, ?, ?, ?)', item);
    }

    // 13. Insert Notification for Bill
    await conn.query(
      'INSERT INTO notifications (customer_id, type, title, message, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id, 'bill_generated', 'New Bill Generated', `Your new bill ${billNumber} for UGX ${totalAmount} has been generated. Due on ${dueDate.toISOString().split('T')[0]}.`, 'pending', new Date()]
    );

    await conn.commit();
    await logAudit(req.user.id, 'GENERATE_BILL', 'Bills', billId, `Generated ${billNumber} - UGX ${totalAmount}`);

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: {
        bill_id: billId,
        bill_number: billNumber,
        total_amount: totalAmount,
        due_date: dueDate.toISOString().split('T')[0],
        breakdown: { units, energyCharge, serviceCharge, taxAmount, penaltyAmount, previousBalance, totalAmount }
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Bill generation failed', error: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllBills = async (req, res) => {
  try {
    const [bills] = await pool.query(`
      SELECT b.*, c.customer_number, c.full_name as customer_name, m.meter_number
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      JOIN meters m ON b.meter_id = m.id
      ORDER BY b.created_at DESC
    `);
    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getBillById = async (req, res) => {
  const { id } = req.params;
  try {
    const [bills] = await pool.query(`
      SELECT b.*, c.customer_number, c.full_name as customer_name, c.address, c.category,
             m.meter_number, u.full_name as generated_by_name
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      JOIN meters m ON b.meter_id = m.id
      LEFT JOIN users u ON b.generated_by = u.id
      WHERE b.id = ?
    `, [id]);
    if (bills.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    const [items] = await pool.query('SELECT * FROM bill_items WHERE bill_id = ?', [id]);
    res.status(200).json({ success: true, data: { ...bills[0], items } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getCustomerBills = async (req, res) => {
  const { customer_id } = req.params;
  try {
    const [bills] = await pool.query(`
      SELECT b.*, m.meter_number
      FROM bills b
      JOIN meters m ON b.meter_id = m.id
      WHERE b.customer_id = ?
      ORDER BY b.billing_year DESC, b.billing_month DESC
    `, [customer_id]);
    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
