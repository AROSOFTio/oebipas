import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { ArrowLeft, User, MapPin, Phone, Mail, Zap, Activity, CreditCard, FileText, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const isActive = status === 'active' || status === 'paid' || status === 'successful';
  return (
    <span className={`inline-flex items-center space-x-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isActive ? <CheckCircle size={12}/> : <XCircle size={12}/>}
      <span>{status?.replace('_', ' ')}</span>
    </span>
  );
};

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axiosInstance.get(`/customers/${id}`);
        setCustomer(res.data.data);
      } catch (err) {
        setError('Failed to load customer details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return <div className="p-6 text-red-500 font-medium">{error}</div>;
  if (!customer) return <div className="p-6 text-gray-500">Customer not found.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/admin/customers" className="p-2 bg-white rounded-lg border border-border hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
          <p className="text-sm text-gray-500">Account #{customer.customer_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-border p-6 text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-primary">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{customer.full_name}</h2>
            <p className="text-gray-500 text-sm">{customer.customer_number}</p>
          </div>
          <StatusBadge status={customer.status} />
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span className="capitalize font-medium bg-gray-50 px-3 py-1 rounded-full">{customer.category}</span>
          </div>
          <p className="text-xs text-gray-400">
            Member since {new Date(customer.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Contact Info */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
          <h3 className="text-lg font-bold border-b border-border pb-3">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3 text-gray-600">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0"><Mail size={18}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{customer.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-gray-600">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-500 shrink-0"><Phone size={18}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{customer.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-gray-600 sm:col-span-2">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0"><MapPin size={18}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Billing Address</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{customer.address || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meters */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
            <Zap size={18} className="mr-2 text-primary"/> Installed Meters
          </h3>
          {customer.meters?.length > 0 ? (
            <div className="space-y-3">
              {customer.meters.map(m => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{m.meter_number}</p>
                    <p className="text-xs text-gray-500">Installed: {m.installation_date ? new Date(m.installation_date).toLocaleDateString() : '—'}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No meters installed.</p>}
        </div>

        {/* Connections */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
            <Activity size={18} className="mr-2 text-primary"/> Service Connections
          </h3>
          {customer.connections?.length > 0 ? (
            <div className="space-y-3">
              {customer.connections.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{c.connection_number}</p>
                    <p className="text-xs text-gray-500">{c.location || c.connection_type || '—'}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No service connections found.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
            <FileText size={18} className="mr-2 text-primary"/> Recent Bills
          </h3>
          {customer.bills?.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="pb-2 text-left font-bold">Bill #</th>
                <th className="pb-2 text-left font-bold">Amount</th>
                <th className="pb-2 text-left font-bold">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {customer.bills.map(b => (
                  <tr key={b.id}>
                    <td className="py-2.5 font-medium text-gray-800">{b.bill_number}</td>
                    <td className="py-2.5">UGX {Number(b.total_amount).toLocaleString()}</td>
                    <td className="py-2.5"><StatusBadge status={b.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-gray-400">No bills generated yet.</p>}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard size={18} className="mr-2 text-primary"/> Recent Payments
          </h3>
          {customer.payments?.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="pb-2 text-left font-bold">Reference</th>
                <th className="pb-2 text-left font-bold">Amount</th>
                <th className="pb-2 text-left font-bold">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {customer.payments.map(p => (
                  <tr key={p.id}>
                    <td className="py-2.5 font-medium text-gray-800">{p.payment_reference}</td>
                    <td className="py-2.5">UGX {Number(p.amount).toLocaleString()}</td>
                    <td className="py-2.5"><StatusBadge status={p.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-gray-400">No payments recorded.</p>}
        </div>
      </div>
    </div>
  );
}
