import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionRequired() {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\&quot;60\&quot; height=\&quot;60\&quot; viewBox=\&quot;0 0 60 60\&quot; xmlns=\&quot;http://www.w3.org/2000/svg\&quot;%3E%3Cg fill=\&quot;none\&quot; fill-rule=\&quot;evenodd\&quot;%3E%3Cg fill=\&quot;%23ffffff\&quot; fill-opacity=\&quot;0.03\&quot;%3E%3Cpath d=\&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50 pointer-events-none"></div>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] opacity-50"></div>
      
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-lg w-full text-center relative z-10 shadow-2xl">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Subscription Required</h1>
        <p className="text-neutral-400 mb-8 leading-relaxed">
          You are successfully logged in, but you don't have an active <b>Tradexa Pro</b> subscription. Access to the trading dashboard and analytics requires a paid account.
        </p>
        
        <div className="space-y-4">
          <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors">
            Upgrade to Pro (Coming Soon)
          </button>
          
          <div className="flex gap-4">
            <Link to="/" className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <button onClick={() => { logout(); window.location.href='/'; }} className="flex-1 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold py-3 rounded-xl hover:bg-red-500/20 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}