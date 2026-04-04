import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { Send, FileText, AlertCircle, MessageSquare, CheckCircle, Clock, Search, X } from 'lucide-react';

export default function CustomerFeedback() {
  const { user } = useContext(AuthContext);
  const [customerId, setCustomerId] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/customers/my-profile');
      if (res.data.linked) {
        setCustomerId(res.data.data.id);
        fetchFeedback(res.data.data.id);
      } else {
        setProfileError('Account Not Linked: Please contact an administrator to link your customer profile before submitting tickets.');
        setLoading(false);
      }
    } catch (err) {
      setProfileError('Unable to verify your account status. Please try refreshing.');
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
    if (!customerId) return;
    if (!form.subject.trim() || !form.message.trim()) return;
    
    setSubmitting(true); setErrorMsg(''); setSubmitSuccess(false);
    try {
      await axiosInstance.post('/feedback', {
        customer_id: customerId,
        subject: form.subject,
        message: form.message
      });
      setForm({ subject: '', message: '' });
      setSubmitSuccess(true);
      fetchFeedback(customerId);
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setErrorMsg('Failed to submit ticket. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      new: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'New Inquiry' },
      in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'In Review' },
      resolved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Resolved' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Archived' }
    };
    const c = configs[status] || configs.closed;
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Support</h1>
        <p className="text-gray-500 font-medium mt-1">Our team typically responds within 24 business hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {profileError ? (
            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 text-center">
              <AlertCircle size={48} className="text-amber-500 mx-auto mb-4 opacity-50"/>
              <h3 className="font-black text-amber-900 text-lg mb-2">Service Limited</h3>
              <p className="text-amber-700 text-sm font-medium leading-relaxed">{profileError}</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-xl border border-border overflow-hidden">
               <div className="bg-sidebar p-8 text-white relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><MessageSquare size={120}/></div>
                  <h2 className="text-xl font-black tracking-tight relative">Open a New Ticket</h2>
                  <p className="text-blue-200 text-xs mt-1 relative">Provide details about your query or concern</p>
               </div>
               
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center text-green-700 animate-in zoom-in duration-300">
                        <CheckCircle size={20} className="mr-3 shrink-0"/>
                        <span className="text-sm font-bold">Ticket submitted successfully!</span>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center text-red-600 animate-in slide-in-from-top duration-300">
                        <AlertCircle size={20} className="mr-3 shrink-0"/>
                        <span className="text-sm font-bold">{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Subject / Inquiry Type</label>
                    <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all font-medium text-gray-800" placeholder="e.g. Broken meter, Billing discrepancy..."/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Message Body</label>
                    <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows="6" className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all font-medium text-gray-800 resize-none" placeholder="Describe your issue or question in detail..."/>
                  </div>
                  
                  <button disabled={submitting} type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3 disabled:opacity-50">
                    {submitting ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Submitting...</span></>
                    ) : (
                        <><span>SUBMIT TICKET</span><Send size={18}/></>
                    )}
                  </button>
               </form>
            </div>
          )}
        </div>

        {/* History Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
               <Clock size={22} className="mr-3 text-primary opacity-50"/>
               Ticket History
            </h2>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
               {feedbacks.length} Records
            </div>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {feedbacks.map(f => (
              <div key={f.id} className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-primary">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{f.subject}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ticket REF-#{f.id.toString().padStart(5, '0')}</p>
                   </div>
                   {getStatusBadge(f.status)}
                </div>
                
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 italic text-sm text-gray-600 leading-relaxed mb-4">
                   "{f.message}"
                </div>

                {f.admin_response ? (
                  <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl relative">
                    <div className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-primary uppercase tracking-widest">Official Response</div>
                    <p className="text-sm text-sidebar font-bold leading-relaxed">{f.admin_response}</p>
                    <div className="mt-3 flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">A</div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support Officer</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-400">
                     <Clock size={14}/>
                     <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Awaiting administrative review...</span>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   <span>Submitted {new Date(f.created_at).toLocaleDateString()}</span>
                   <span>Last Update {new Date(f.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            
            {feedbacks.length === 0 && (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] py-20 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Search size={32}/>
                 </div>
                 <p className="font-black text-gray-400 tracking-tight">No support history found</p>
                 <p className="text-xs text-gray-400 mt-2">Active tickets will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
