import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Settings as SettingsIcon, Save, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

export default function Settings() {
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === 'Super Admin';
  const [settings, setSettings] = useState({
    company_name: '',
    currency: '',
    tax_rate: '',
    default_due_days: '',
    pesapal_consumer_key: '',
    pesapal_consumer_secret: '',
    pesapal_ipn_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get('/settings');
        if (res.data.data) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    
    try {
      setSaving(true);
      await axiosInstance.put('/settings', settings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update settings. See console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 text-sm">Global configurations for OEBIPAS</p>
        </div>
      </div>

      {!isSuperAdmin && (
         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start space-x-3">
           <AlertTriangle size={20} className="mt-0.5" />
           <div>
             <h3 className="font-bold">Read-Only Mode</h3>
             <p className="text-sm">You do not have Super Admin privileges to modify the core system parameters.</p>
           </div>
         </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Company / Utility Name</label>
              <input
                type="text"
                name="company_name"
                value={settings.company_name || ''}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Default Currency</label>
              <input
                type="text"
                name="currency"
                value={settings.currency || ''}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tax Rate / VAT (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="tax_rate"
                value={settings.tax_rate || ''}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Default Payment Window (Days)</label>
              <input
                type="number"
                min="1"
                name="default_due_days"
                value={settings.default_due_days || ''}
                onChange={handleChange}
                disabled={!isSuperAdmin}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
            </div>
            
          </div>

          <div className="pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3">💳</span>
              Pesapal Live API Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Consumer Key</label>
                <input
                  type="text"
                  name="pesapal_consumer_key"
                  value={settings.pesapal_consumer_key || ''}
                  onChange={handleChange}
                  disabled={!isSuperAdmin}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 font-mono text-sm"
                  placeholder="Enter Pesapal Consumer Key"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Consumer Secret</label>
                <input
                  type="password"
                  name="pesapal_consumer_secret"
                  value={settings.pesapal_consumer_secret || ''}
                  onChange={handleChange}
                  disabled={!isSuperAdmin}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 font-mono text-sm"
                  placeholder="Enter Pesapal Consumer Secret"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700">IPN URL / ID</label>
                <input
                  type="text"
                  name="pesapal_ipn_id"
                  value={settings.pesapal_ipn_id || ''}
                  onChange={handleChange}
                  disabled={!isSuperAdmin}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 font-mono text-sm"
                  placeholder="e.g. b5f4c4a8-6fbg-4bcd-8846-5..."
                />
                <p className="text-xs text-gray-500 mt-1">This ID handles automatic payment webhook reconciliation.</p>
              </div>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={saving}
                className="flex items-center space-x-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
