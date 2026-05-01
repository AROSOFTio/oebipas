import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';
import { subscribeToPaymentSync } from '../../utils/paymentSync';

export default function MakePayment() {
  const location = useLocation();
  const initialBillIds = (location.state?.bill_ids || []).map(id => String(id));
  const [bills, setBills] = useState([]);
  const [mode, setMode] = useState(location.state?.mode === 'pay_all' ? 'pay_all' : 'select');
  const [selectedBillIds, setSelectedBillIds] = useState(initialBillIds);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const incomingBillIds = (location.state?.bill_ids || []).map(id => String(id));
    if (incomingBillIds.length) {
      setSelectedBillIds(incomingBillIds);
      setMode(location.state?.mode === 'pay_all' ? 'pay_all' : 'select');
    }
  }, [location.state]);

  useEffect(() => {
    const loadBills = async () => {
      const response = await axiosInstance.get('/bills/mine');
      const outstandingBills = response.data.data.filter(item => Number(item.balance_due) > 0);
      setBills(outstandingBills);
      setSelectedBillIds(current =>
        current.filter(id => outstandingBills.some(bill => String(bill.id) === id))
      );
    };

    loadBills();
    return subscribeToPaymentSync(loadBills);
  }, []);

  useEffect(() => {
    if (mode === 'pay_all') {
      setSelectedBillIds(bills.map(bill => String(bill.id)));
    }
  }, [mode, bills]);

  const selectedBills = bills.filter(bill => selectedBillIds.includes(String(bill.id)));
  const selectedTotal = Number(
    selectedBills.reduce((sum, bill) => sum + Number(bill.balance_due || 0), 0).toFixed(2)
  );

  const toggleBill = billId => {
    if (mode === 'pay_all') return;
    const id = String(billId);
    setSelectedBillIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const changeMode = nextMode => {
    setMode(nextMode);
    setError('');
    if (nextMode === 'select') {
      setSelectedBillIds([]);
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    if (!selectedBillIds.length || selectedTotal <= 0) {
      setError('Select at least one outstanding bill to continue.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/payments/initiate', {
        bill_ids: selectedBillIds.map(Number),
        amount: selectedTotal,
        pay_all: mode === 'pay_all',
      });
      setMessage('Redirecting to Pesapal secure checkout...');
      window.location.href = response.data.data.redirect_url;
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to redirect to Pesapal.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-[var(--panel-strong)] px-6 py-5 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Payment Gateway</p>
          <h2 className="mt-1 text-xl font-semibold">Pesapal Secure Checkout</h2>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-soft">
          <p className="text-sm text-slate-500">Outstanding Bills</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{bills.length}</p>
        </div>
      </div>

      <SectionCard title="Pay Bill">
        {message && (
          <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => changeMode('pay_all')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                mode === 'pay_all'
                  ? 'bg-[var(--panel-strong)] text-white'
                  : 'border border-slate-200 text-slate-700'
              }`}
            >
              Pay All
            </button>
            <button
              type="button"
              onClick={() => changeMode('select')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                mode === 'select'
                  ? 'bg-[var(--panel-strong)] text-white'
                  : 'border border-slate-200 text-slate-700'
              }`}
            >
              Select Bills
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
              Selected total: UGX {Number(selectedTotal).toLocaleString()}
            </div>
            <div className="divide-y divide-slate-100">
              {bills.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400">No outstanding bills found.</p>
              ) : (
                bills.map(bill => (
                  <label key={bill.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedBillIds.includes(String(bill.id))}
                        disabled={mode === 'pay_all'}
                        onChange={() => toggleBill(bill.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[var(--panel-strong)] focus:ring-[var(--panel-strong)]"
                      />
                      <span className="font-medium text-slate-900">{bill.bill_number}</span>
                    </span>
                    <span className="text-slate-600">UGX {Number(bill.balance_due).toLocaleString()}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedBillIds.length}
            className="w-full rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Connecting to Pesapal...' : 'Continue to Pesapal'}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
