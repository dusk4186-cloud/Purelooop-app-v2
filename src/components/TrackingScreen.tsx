import { ArrowLeft, CheckCircle2, Clock, FileText, Home, Phone, Star, User, Bell, X } from 'lucide-react';
import type { ScreenName } from '../App';
import { useState } from 'react';

interface TrackingProps {
  onNavigate: (screen: ScreenName) => void;
}

export default function TrackingScreen({ onNavigate }: TrackingProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const statuses = [
    { title: 'Order Placed', desc: 'August 12, 09:30 AM', active: true, completed: true },
    { title: 'Driver Assigned', desc: 'August 12, 09:45 AM', active: true, completed: true },
    { title: 'Out for Pickup', desc: 'Arriving in 15 mins', active: true, completed: false },
    { title: 'In Service', desc: 'Pending', active: false, completed: false },
    { title: 'Delivered', desc: 'Pending', active: false, completed: false },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bg-main relative">
      {/* Empty Notifications Modal */}
      {showNotificationModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-bg-card w-full rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Notifications</h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-text-secondary bg-bg-elevated p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-text-secondary" />
              </div>
              <p className="text-text-primary font-medium text-lg">All caught up!</p>
              <p className="text-text-secondary text-sm">No new notifications right now.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="p-6 pt-12 flex justify-between items-center bg-bg-main shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-full cursor-pointer bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-transparent hover:border-accent-primary transition-colors"
          >
            <img src="https://i.pravatar.cc/100?img=12" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-text-secondary">Tracking Order</span>
            <span className="text-sm font-semibold text-text-primary">#ORD-4921</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotificationModal(true)} className="relative p-2 text-text-secondary bg-bg-card rounded-full shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="flex flex-col items-center pt-8 pb-8 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Successful!</h2>
          <p className="text-sm text-text-secondary max-w-[250px]">
            Your booking is confirmed. Our driver will be there soon.
          </p>
        </div>

        <div className="bg-bg-card border border-border-color rounded-2xl p-6 text-left flex flex-col gap-6 relative shadow-sm">
          {statuses.map((step, i) => (
            <div key={i} className={`flex items-start gap-4 relative ${!step.active ? 'opacity-50' : ''}`}>
              {/* Connector line */}
              {i < statuses.length - 1 && (
                <div className="absolute left-[7px] top-5 w-[2px] h-[calc(100%+8px)] bg-border-color" />
              )}
              
              <div className="relative z-10 mt-0.5">
                <div className={`w-4 h-4 rounded-full ${
                  step.completed 
                    ? 'bg-accent-primary shadow-[0_0_0_4px_var(--color-accent-glow)]' 
                    : step.active
                      ? 'bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.2)]'
                      : 'bg-border-color'
                }`} />
              </div>
              
              <div>
                <h4 className={`text-sm font-semibold mb-1 ${step.active ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-text-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color flex justify-around p-4 pb-8 z-20">
        <button onClick={() => onNavigate('home')} className="text-text-secondary"><Home className="w-6 h-6" /></button>
        <button className="text-accent-primary"><FileText className="w-6 h-6" /></button>
        <button onClick={() => onNavigate('profile')} className="text-text-secondary"><User className="w-6 h-6" /></button>
      </nav>
    </div>
  );
}
