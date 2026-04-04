import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Phone, Mail } from 'lucide-react';

export default function CustomerDetails() {
  const { id } = useParams();

  // In a real app, fetch customer details by ID here. 
  // We'll simulate it for phase 2.

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admin/customers" className="p-2 bg-white rounded-lg border border-border hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-border p-6 text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-primary">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
            <p className="text-gray-500">CUST-{id.padStart(6, '0')}</p>
          </div>
          <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
            ACTIVE
          </span>
        </div>

        {/* Info Card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
          <h3 className="text-lg font-semibold border-b border-border pb-3">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3 text-gray-600">
              <Mail className="mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Address</p>
                <p className="text-sm">john.doe@example.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-gray-600">
              <Phone className="mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone Number</p>
                <p className="text-sm">0701111111</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-gray-600">
              <MapPin className="mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-900">Billing Address</p>
                <p className="text-sm">Plot 10, Kampala Road</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
