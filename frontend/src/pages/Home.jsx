import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-sidebar">OEBIPAS</h1>
        <p className="text-gray-600">Online Electricity Billing and Payment System</p>
        
        <div className="pt-4 flex flex-col space-y-3">
          <Link 
            to="/login" 
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Login to Account
          </Link>
        </div>
      </div>
    </div>
  );
}
