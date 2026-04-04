const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

exports.getSettings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT key_name, value_text FROM settings');
    // Convert array of objects to a single object format { key: value }
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key_name] = s.value_text;
    });
    res.status(200).json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
};

exports.updateSettings = async (req, res) => {
  const updates = req.body; // e.g. { company_name: "New Name", tax_rate: "18" }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const [key, value] of Object.entries(updates)) {
      await conn.query(
        'INSERT INTO settings (key_name, value_text, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value_text = ?, updated_by = ?',
        [key, String(value), req.user.id, String(value), req.user.id]
      );
    }
    await conn.commit();
    await logAudit(req.user.id, 'UPDATE_SETTINGS', 'Settings', null, 'Updated system settings');
    res.status(200).json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    await conn.rollback();
    console.error('Update Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  } finally {
    conn.release();
  }
};
