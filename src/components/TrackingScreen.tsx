import { ArrowLeft, CheckCircle2, Clock, FileText, Home, Phone, Star, User, Bell, X } from 'lucide-react';
import type { ScreenName } from '../App';
import { useState } from 'react';
import { auth } from '../lib/firebase';

interface TrackingProps {
  onNavigate: (screen: ScreenName) => void;
  hasActiveOrder?: boolean;
}

export default function TrackingScreen({ onNavigate, hasActiveOrder = false }: TrackingProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const time1 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  now.setMinutes(now.getMinutes() + 15);
  const time2 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const statuses = [
    { title: 'Order Placed', desc: `${dateStr}, ${time1}`, active: true, completed: true },
    { title: 'Driver Assigned', desc: `${dateStr}, ${time2}`, active: true, completed: true },
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
            className="w-10 h-10 rounded-full cursor-pointer bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-transparent hover:border-accent-primary transition-colors flex items-center justify-center text-accent-primary font-bold"
          >
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover bg-bg-elevated" />
            ) : (
              <div className="w-full h-full bg-accent-primary/10 flex items-center justify-center text-lg">
                {auth.currentUser?.displayName ? auth.currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-text-secondary">{hasActiveOrder ? 'Tracking Order' : 'My Orders'}</span>
            <span className="text-sm font-semibold text-text-primary">{hasActiveOrder ? '#ORD-4921' : (auth.currentUser?.displayName?.split(' ')[0] || 'User')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotificationModal(true)} className="relative p-2 text-text-secondary bg-bg-card rounded-full shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        {!hasActiveOrder ? (
          <div className="flex flex-col items-center justify-center h-full pt-20 pb-8 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">No Active Orders</h2>
            <p className="text-sm text-text-secondary max-w-[250px] mb-8">
              You don't have any laundry orders in progress at the moment.
            </p>
            <button 
              onClick={() => onNavigate('home')}
              className="px-6 py-3 rounded-xl font-semibold bg-accent-primary text-white shadow-sm active:scale-[0.98] transition-transform"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <nav className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color flex justify-around p-4 pb-8 z-20">
        <button onClick={() => onNavigate('home')} className="text-text-secondary"><Home className="w-6 h-6" /></button>
        <button className="text-accent-primary"><FileText className="w-6 h-6" /></button>
        <button onClick={() => onNavigate('profile')} className="text-text-secondary"><User className="w-6 h-6" /></button>
      </nav>
    </div>
  );
}
