import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { MessageSquare, Check, UserPlus, Shield, Activity } from 'lucide-react';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({});
  const [assignmentMap, setAssignmentMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedbackRes, officerRes] = await Promise.all([
        axiosInstance.get('/feedback'),
        axiosInstance.get('/users/officers')
      ]);
      setFeedbacks(feedbackRes.data.data);
      setOfficers(officerRes.data.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = statusMap[id] || currentStatus;
    if (newStatus === currentStatus) return;
    
    try {
      await axiosInstance.patch(`/feedback/${id}/status`, { status: newStatus });
      fetchData();
      setStatusMap(prev => {
        const next = {...prev};
        delete next[id];
        return next;
      });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAssignment = async (id) => {
    const assigned_to = assignmentMap[id];
    if (!assigned_to) return;

    try {
      await axiosInstance.patch(`/feedback/${id}/assign`, { assigned_to });
      fetchData();
      setAssignmentMap(prev => {
        const next = {...prev};
        delete next[id];
        return next;
      });
    } catch (err) {
      alert("Failed to forward ticket");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">NEW</span>;
      case 'assigned': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200">ASSIGNED</span>;
      case 'in_progress': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-200">IN PROGRESS</span>;
      case 'resolved': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">RESOLVED</span>;
      case 'closed': return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">CLOSED</span>;
      default: return null;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading Support Command Center...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mr-4 shadow-inner">
               <MessageSquare size={28} />
            </div>
            Feedback & Support Review
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1 ml-16 italic">Manage and forward tickets to appropriate officers</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Customer / Category</th>
                <th className="px-8 py-6">Subject & Message</th>
                <th className="px-8 py-6">Assignment</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feedbacks.map(f => (
                <tr key={f.id} className="hover:bg-gray-50/50 transition-all text-sm group">
                  <td className="px-8 py-6 align-top">
                    <div className="space-y-1">
                      <span className="font-black text-gray-900 block text-base">{f.customer_name}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{f.customer_number}</span>
                      <div className="pt-2">
                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md border border-gray-200 uppercase">{f.category || 'General Inquiry'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top max-w-sm">
                    <span className="font-black text-gray-800 block mb-2 text-primary tracking-tight underline decoration-primary/10 decoration-2 underline-offset-4">{f.subject}</span>
                    <p className="text-gray-600 text-xs leading-relaxed font-medium line-clamp-3">{f.message}</p>
                    <span className="text-[10px] font-bold text-gray-400 mt-3 block italic tracking-wider">
                      Created: {new Date(f.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-6 align-top">
                    {f.assigned_officer_name ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-primary bg-primary/5 px-3 py-2 rounded-xl border border-primary/10 w-fit animate-in zoom-in duration-300">
                          <Shield size={14} className="shrink-0"/>
                          <span className="text-[11px] font-black uppercase tracking-tight">{f.assigned_officer_name}</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 pl-1 uppercase tracking-widest italic">{f.assigned_officer_role}</p>
                        
                        {/* Allow re-assignment for Help Desk */}
                        <div className="pt-2 flex items-center space-x-2">
                           <select 
                            value={assignmentMap[f.id] || ''}
                            onChange={(e) => setAssignmentMap({...assignmentMap, [f.id]: e.target.value})}
                            className="bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1 outline-none border border-transparent focus:border-primary transition-all pr-6 appearance-none"
                          >
                            <option value="">Re-assign...</option>
                            {officers.map(o => (
                              <option key={o.id} value={o.id}>{o.full_name} ({o.role})</option>
                            ))}
                          </select>
                          {assignmentMap[f.id] && (
                             <button onClick={() => handleAssignment(f.id)} className="bg-primary text-white p-1 rounded-lg hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                               <UserPlus size={12}/>
                             </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Unassigned Ticket</span>
                        <div className="flex items-center space-x-2">
                          <select 
                            className="bg-white border-2 border-dashed border-gray-200 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-600 outline-none focus:border-primary focus:border-solid transition-all min-w-[140px]"
                            value={assignmentMap[f.id] || ''}
                            onChange={(e) => setAssignmentMap({...assignmentMap, [f.id]: e.target.value})}
                          >
                            <option value="">Choose Officer...</option>
                            {officers.map(o => (
                              <option key={o.id} value={o.id}>{o.full_name} ({o.role})</option>
                            ))}
                          </select>
                          {assignmentMap[f.id] && (
                             <button 
                               onClick={() => handleAssignment(f.id)}
                               className="bg-primary text-white p-2 rounded-xl hover:bg-primary-dark transition-all shadow-md group active:scale-95"
                               title="Forward Ticket"
                             >
                               <UserPlus size={16} className="group-hover:translate-x-0.5 transition-transform"/>
                             </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 align-top">
                    {getStatusBadge(f.status)}
                    {f.admin_response && (
                       <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 max-w-[200px]">
                          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center"><Activity size={10} className="mr-1"/> Latest Response</p>
                          <p className="text-[10px] text-gray-600 font-medium italic line-clamp-2">{f.admin_response}</p>
                       </div>
                    )}
                  </td>
                  <td className="px-8 py-6 align-top text-right">
                    <div className="flex flex-col items-end space-y-3">
                       <select 
                         value={statusMap[f.id] || f.status} 
                         onChange={(e) => setStatusMap({...statusMap, [f.id]: e.target.value})}
                         className="bg-white border border-border shadow-sm rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700"
                       >
                         <option value="new">New</option>
                         <option value="assigned">Assigned</option>
                         <option value="in_progress">In Progress</option>
                         <option value="resolved">Resolved</option>
                         <option value="closed">Closed</option>
                       </select>
                       <button 
                         onClick={() => handleStatusUpdate(f.id, f.status)}
                         className="bg-sidebar text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-primary/20 transition-all transform active:scale-95 hover:-translate-y-0.5"
                       >
                         Update Status
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-gray-300 opacity-20">
                      <MessageSquare size={80} className="mb-4" />
                      <p className="text-xl font-black uppercase tracking-widest tracking-tighter">Support Inbox Empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
