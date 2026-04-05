import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, Zap, Receipt, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../utils/axiosInstance';

export default function GlobalSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      fetchResults();
    } else {
      setResults(null);
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/dashboard/search?q=${encodeURIComponent(query)}`);
      setResults(data.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
        <Search size={48} className="text-gray-300"/>
        <h2 className="text-xl font-medium">Use the top search bar to find anything</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
           <p className="text-sm text-gray-500 mt-1">Showing results for <span className="font-bold text-primary">"{query}"</span></p>
        </div>
        {loading && <Loader2 className="animate-spin text-primary" size={24} />}
      </div>

      {!loading && results && (
        <div className="grid grid-cols-1 gap-6">
          
          {/* Customers */}
          {results.customers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-3 bg-gray-50/50">
                <Users className="text-blue-500" size={20} />
                <h3 className="font-bold text-gray-900">Customers ({results.customers.length})</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {results.customers.map(c => (
                  <li key={c.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{c.full_name}</div>
                      <div className="text-xs text-gray-500">{c.customer_number} • {c.email} • {c.phone}</div>
                    </div>
                    <Link to={`/admin/customers/${c.id}`} className="text-primary hover:text-blue-700 bg-blue-50 p-2 rounded-lg">
                      <ArrowRight size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Connections */}
          {results.connections.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-3 bg-gray-50/50">
                <Zap className="text-yellow-500" size={20} />
                <h3 className="font-bold text-gray-900">Connections & Meters ({results.connections.length})</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {results.connections.map(c => (
                  <li key={c.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Meter: {c.meter_number}</div>
                      <div className="text-xs text-gray-500">Conn: {c.connection_number} • Customer: {c.customer_name}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bills */}
          {results.bills.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-3 bg-gray-50/50">
                <Receipt className="text-orange-500" size={20} />
                <h3 className="font-bold text-gray-900">Invoices ({results.bills.length})</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {results.bills.map(b => (
                  <li key={b.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Invoice: {b.bill_number}</div>
                      <div className="text-xs text-gray-500">{b.customer_name} • amount: UGX {parseFloat(b.total_amount).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty State */}
          {results.customers.length === 0 && results.connections.length === 0 && results.bills.length === 0 && results.payments.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-500">
              No exact matches found for "{query}". Try checking your spelling or using a partial ID.
            </div>
          )}

        </div>
      )}
    </div>
  );
}
