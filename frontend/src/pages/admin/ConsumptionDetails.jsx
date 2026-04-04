import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, Info, CalendarClock } from 'lucide-react';

export default function ConsumptionDetails() {
  const { id } = useParams();

  // In a full implementation, we fetch the `id` from /consumption/:id API.
  // For Phase 3 scope, we'll demonstrate the UI shell.

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admin/consumption" className="p-2 bg-white rounded-lg border border-border hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Reading Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metric Card */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex items-center space-x-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Units Consumed (kWh)</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">345.50</h2>
            <p className="text-xs text-green-600 font-medium mt-1">Valid Reading</p>
          </div>
        </div>

        {/* Audit Data */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold flex items-center space-x-2 border-b border-border pb-3">
            <Info size={18} className="text-gray-400" />
            <span>Metadata & Audit</span>
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Record ID</span>
              <span className="font-medium text-gray-900">REC-0000{id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Billing Period</span>
              <span className="font-medium text-gray-900">04/2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Logged By</span>
              <span className="font-medium text-sidebar">Billing Staff</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border border-dashed">
              <span className="text-gray-500 flex items-center space-x-1"><CalendarClock size={14}/><span>Timestamp</span></span>
              <span className="text-gray-600">April 4, 2026</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
