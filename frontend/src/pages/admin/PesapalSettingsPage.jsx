import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage';
import PageHeader from '../../components/common/PageHeader';
import { fetchSettings, saveSettings } from '../../services/settingService';
import LoadingState from '../../components/common/LoadingState';

const initialForm = {
  'pesapal.env': 'sandbox',
  'pesapal.consumer_key': '',
  'pesapal.consumer_secret': '',
};

export default function PesapalSettingsPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchSettings();
        setForm((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Failed to load settings from database:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await saveSettings(form);
      setMessage('Pesapal API settings successfully synchronized to the secure live database.');
    } catch (err) {
      setError(err.message || 'Failed to save settings permanently.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading secure configuration..." />;
  }

  return (
    <section className="form-card list-stack">
      <PageHeader
        title="Pesapal API Configuration"
        subtitle="Manage the Live Payment bindings mapping to your Pesapal Merchant proxy interface."
      />
      <AlertMessage tone="info">
        Ensure your Pesapal v3 Consumer Key and Secret are securely entered. Use Sandbox mode during testing.
      </AlertMessage>
      {error && <AlertMessage tone="error">{error}</AlertMessage>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="pesapal.env">API Environment</label>
          <select 
            id="pesapal.env" 
            name="pesapal.env" 
            value={form['pesapal.env']} 
            onChange={handleChange}
            className="input-field"
          >
            <option value="sandbox">Sandbox (Testing)</option>
            <option value="live">Live (Production)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pesapal.consumer_key">Consumer Key</label>
          <input 
            id="pesapal.consumer_key" 
            name="pesapal.consumer_key" 
            value={form['pesapal.consumer_key'] || ''} 
            onChange={handleChange} 
            placeholder="Enter Consumer Key"
          />
        </div>
        <div className="field">
          <label htmlFor="pesapal.consumer_secret">Consumer Secret</label>
          <input 
            id="pesapal.consumer_secret" 
            name="pesapal.consumer_secret" 
            type="password"
            value={form['pesapal.consumer_secret'] || ''} 
            onChange={handleChange} 
            placeholder="Enter Consumer Secret"
          />
        </div>
        <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Synchronizing API Keys...' : 'Commit Pesapal Settings'}
          </button>
        </div>
      </form>
      {message && <AlertMessage tone="success">{message}</AlertMessage>}
    </section>
  );
}
