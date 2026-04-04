import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { Send, FileText, AlertCircle } from 'lucide-react';

export default function CustomerFeedback() {
  const { user } = useContext(AuthContext);
  const [customerId, setCustomerId] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/customers/my-profile');
      setCustomerId(res.data.data.id);
      fetchFeedback(res.data.data.id);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileError('No customer profile linked to your account. Please contact support.');
      } else {
        setProfileError('Failed to load profile.');
      }
      setLoading(false);
    }
  };

  const fetchFeedback = async (cid) => {
    try {
      const res = await axiosInstance.get(`/feedback?customer_id=${cid}`);
      setFeedbacks(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) { setSubmitMsg('❌ No customer profile linked.'); return; }
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true); setSubmitMsg('');
    try {
      await axiosInstance.post('/feedback', {
        customer_id: customerId,
        subject: form.subject,
        message: form.message
      });
      setForm({ subject: '', message: '' });
      setSubmitMsg('✅ Your ticket was submitted successfully. We will get back to you soon.');
      fetchFeedback(customerId);
    } catch (err) {
      setSubmitMsg('❌ Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support & Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">Submit inquiries or report issues</p>
        </div>

        {profileError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0"/>
            <p className="text-red-700 text-sm">{profileError}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          {submitMsg && (
            <div className={`p-4 rounded-lg mb-4 text-sm font-medium ${submitMsg.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {submitMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} type="text" className="w-full border border-border px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none" placeholder="e.g. Broken meter, Billing issue..."/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows="5" className="w-full border border-border px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none" placeholder="Describe your issue in detail..."/>
            </div>
            <button disabled={submitting || !!profileError} type="submit" className="flex justify-center items-center w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold shadow disabled:opacity-50">
              <Send size={18} className="mr-2"/> {submitting ? 'Sending...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 pt-2">My Previous Tickets</h2>
        {loading ? <p className="text-gray-500 text-sm">Loading tickets...</p> : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {feedbacks.map(f => (
              <div key={f.id} className="bg-white p-5 rounded-xl border border-border shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{f.subject}</h3>
                  <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold shrink-0 ml-2 ${getStatusColor(f.status)}`}>{f.status.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-600">"{f.message}"</p>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-400">{new Date(f.created_at).toLocaleString()}</span>
                </div>
                {f.admin_response && (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Support Response:</p>
                    <p className="text-sm text-blue-900">{f.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
            {feedbacks.length === 0 && <p className="text-gray-500 bg-white p-6 rounded-xl border border-border text-center text-sm">No tickets opened yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
