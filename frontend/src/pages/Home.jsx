import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [activeTab, setActiveTab] = useState('abstract');

  return (
    <div className="min-h-screen bg-[#eaedf5] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 font-sans">
      
      {/* The Book Cover Container */}
      <div 
        className="group relative w-full sm:max-w-2xl lg:max-w-4xl bg-white min-h-[90vh] sm:min-h-[85vh] rounded-r-[2rem] sm:rounded-r-[3rem] rounded-l-lg sm:rounded-l-2xl shadow-[15px_15px_40px_rgba(0,0,0,0.08),-3px_0_10px_rgba(0,0,0,0.03)] p-1.5 sm:p-2 transition-transform duration-700 hover:-translate-y-2 animate-slide-up-fade flex"
      >
        {/* Book Spine / Binding Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-5 md:w-10 bg-gradient-to-r from-slate-200 via-slate-100 to-white rounded-l-lg sm:rounded-l-2xl border-r border-slate-200/50 z-0" />

        {/* Outer Page Border (Animated Radius & Border) */}
        <div className="relative z-10 w-full ml-3 md:ml-8 border-2 sm:border-4 border-slate-100 rounded-r-[1.75rem] sm:rounded-r-[2.5rem] rounded-l-sm p-0.5 sm:p-2 transition-all duration-700 ease-in-out group-hover:border-[#3543bb]/30 group-hover:rounded-r-[4rem] overflow-hidden flex flex-col">
          
          {/* Inner Page Frame */}
          <div className="flex-1 w-full border border-slate-200 rounded-r-[1.5rem] sm:rounded-r-[2rem] rounded-l-sm p-5 sm:p-8 lg:p-12 flex flex-col bg-slate-50/30 transition-all duration-700 group-hover:bg-white relative">
            
            {/* Top Academic Header */}
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-8 text-center relative z-20">
              <img src="/logo.png" alt="UEDCL Logo" className="h-20 w-20 object-contain drop-shadow-sm mb-6" />
              
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#3543bb] mb-8">
                Academic Project Demonstrator
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight max-w-2xl px-4 transition-all duration-500">
                Online Electricity Billing <br className="hidden sm:block"/> and Payment System
              </h1>

              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-slate-300" />
                <span className="text-base sm:text-lg font-bold uppercase tracking-widest text-slate-500">
                  A Case of UEDCL
                </span>
                <div className="h-px w-12 bg-slate-300" />
              </div>
            </div>

            {/* Content Abstract / Features -> Styled like a Book Index */}
            <div className="flex-1 mt-12 flex flex-col items-center w-full max-w-2xl mx-auto z-20 relative">
              
              {/* Clean Table of Contents Toggle */}
              <div className="flex items-center justify-center gap-6 border-b-2 border-slate-200 w-full max-w-sm mb-8">
                <button
                  onClick={() => setActiveTab('abstract')}
                  className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 -mb-0.5 ${
                    activeTab === 'abstract' ? 'border-[#3543bb] text-[#3543bb]' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  System Features
                </button>
                <button
                  onClick={() => setActiveTab('tech')}
                  className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 -mb-0.5 ${
                    activeTab === 'tech' ? 'border-[#3543bb] text-[#3543bb]' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Technologies Used
                </button>
              </div>

              {/* Dynamic Content */}
              <div className="w-full text-slate-600 min-h-[160px] animate-slide-up-fade">
                {activeTab === 'abstract' ? (
                  <ul className="space-y-4 font-medium text-sm sm:text-base border-l-2 border-slate-200 pl-6 mx-auto w-fit">
                    <li className="flex items-center gap-4">
                      <span className="text-[#3543bb] font-bold">01.</span> User Account Registration and Authentication
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="text-[#3543bb] font-bold">02.</span> Automated Monthly Bill Generation
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="text-[#3543bb] font-bold">03.</span> Online Payment via Pesapal Gateway
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="text-[#3543bb] font-bold">04.</span> Automatic Penalty and Overdue Calculation
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="text-[#3543bb] font-bold">05.</span> Email and SMS Notifications
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="text-[#3543bb] font-bold">06.</span> Role-Based Access for Staff and Customers
                    </li>
                  </ul>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-left max-w-md mx-auto">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3543bb]">Frontend</p>
                      <p className="mt-1 text-sm font-medium">React.js, Tailwind, Vite</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3543bb]">Backend</p>
                      <p className="mt-1 text-sm font-medium">Node.js, Express.js</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3543bb]">Database</p>
                      <p className="mt-1 text-sm font-medium">MySQL Relational Engine</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3543bb]">Security Modules</p>
                      <p className="mt-1 text-sm font-medium">JWT, bcrypt Auth</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons -> Styled like physical seals/buttons */}
            <div className="mt-10 sm:mt-16 flex flex-row items-center justify-center gap-3 w-full z-20 relative pb-4">
               <Link to="/login" className="flex-1 sm:flex-none relative group overflow-hidden rounded-full bg-[#3543bb] px-6 sm:px-10 py-3.5 text-sm font-bold tracking-widest text-white shadow-lg transition-transform hover:-translate-y-1 text-center">
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                 <span className="relative uppercase">Login</span>
               </Link>
               <Link to="/register" className="flex-1 sm:flex-none rounded-full border border-slate-300 bg-white px-6 sm:px-10 py-3.5 text-sm font-bold uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 hover:-translate-y-1 text-center">
                 Register
               </Link>
            </div>
            
            {/* Subtle aesthetic watermark on the page */}
            <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-[0.03] text-9xl font-serif">
              OEBIPAS
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
