import { ArrowLeft, CheckCircle2, Clock, FileText, Home, Phone, Star, User, Bell, X, ChevronRight, Receipt } from 'lucide-react';
import type { ScreenName } from '../App';
import { useState } from 'react';
import { auth } from '../lib/firebase';

interface TrackingProps {
  onNavigate: (screen: ScreenName) => void;
  hasActiveOrder?: boolean;
  activeOrderDetails?: { date: string, time: string } | null;
  paymentMethod?: string;
  activeServices?: string[];
}

export default function TrackingScreen({ onNavigate, hasActiveOrder = false, activeOrderDetails = null, paymentMethod = 'card', activeServices = ['WashFold'] }: TrackingProps) {
  const [activeTab, setActiveTab] = useState<'active'|'history'>('active');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedPastOrder, setSelectedPastOrder] = useState<any>(null);
  const [rating, setRating] = useState(0);

  const now = new Date();
  const currentHour = now.getHours();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const time1 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  now.setMinutes(now.getMinutes() + 15);
  const time2 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Store operating hours are 9:00 AM (8h) to 8:00 PM (20h)
  const isOutsideOperatingHours = currentHour < 8 || currentHour >= 20;

  // Determine if pickup should show as scheduled vs instant driver dispatch
  let scheduledDesc = activeOrderDetails
    ? `${activeOrderDetails.date}, ${activeOrderDetails.time}`
    : isOutsideOperatingHours
      ? (currentHour < 8 ? `Today, 09:00 AM` : `Tomorrow, 09:00 AM`)
      : null;

  const baseStatuses = scheduledDesc
    ? [
        { title: 'Order Placed', desc: `${dateStr}, ${time1}`, active: true, completed: true },
        { title: 'Pickup Scheduled', desc: scheduledDesc, active: true, completed: false }
      ]
    : [
        { title: 'Order Placed', desc: `${dateStr}, ${time1}`, active: true, completed: true },
        { title: 'Driver Assigned', desc: `${dateStr}, ${time2}`, active: true, completed: true },
        { title: 'Out for Pickup', desc: 'Arriving in 15 mins', active: true, completed: false }
      ];

  const serviceStatuses = [];
  if (activeServices.includes('WashFold') || activeServices.includes('WashIron')) {
    serviceStatuses.push({ title: 'Washing', desc: 'Pending', active: false, completed: false });
  }
  if (activeServices.includes('DryClean')) {
    serviceStatuses.push({ title: 'Dry Cleaning', desc: 'Pending', active: false, completed: false });
  }
  if (activeServices.includes('Iron') || activeServices.includes('WashIron')) {
    serviceStatuses.push({ title: 'Steam Ironing', desc: 'Pending', active: false, completed: false });
  }

  const endStatuses = [
    { title: 'Out for Delivery', desc: 'Pending', active: false, completed: false },
    { title: 'Delivered', desc: 'Pending', active: false, completed: false }
  ];

  const statuses = [...baseStatuses, ...serviceStatuses, ...endStatuses];

  const mockPastOrders = [
    {
      id: 'ORD-4012',
      date: 'July 15, 2026',
      provider: 'EcoWash',
      items: 'Wash & Fold, Wash & Iron',
      total: '₹340',
      status: 'Delivered',
      details: [
        { label: 'Wash & Fold Pile (2.5 kg)', price: '₹200' },
        { label: 'Wash & Iron Pile (0.9 kg)', price: '₹103' },
        { label: 'Platform Fee', price: '₹15' },
        { label: 'Taxes', price: '₹22' }
      ]
    },
    {
      id: 'ORD-3899',
      date: 'June 28, 2026',
      provider: 'Iron Master',
      items: 'Iron Only (4.5 kg)',
      total: '₹285',
      status: 'Delivered',
      details: [
        { label: 'Iron Only (4.5 kg)', price: '₹270' },
        { label: 'Platform Fee', price: '₹15' }
      ]
    },
    {
      id: 'ORD-3520',
      date: 'June 10, 2026',
      provider: 'EcoWash',
      items: '2 Dry Clean',
      total: '₹430',
      status: 'Cancelled',
      details: [
        { label: 'Dry Clean (2 pieces)', price: '₹398' },
        { label: 'Platform Fee', price: '₹15' },
        { label: 'Taxes', price: '₹17' }
      ]
    }
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
            <span className="text-xs text-text-secondary">{hasActiveOrder && activeTab === 'active' ? 'Tracking Order' : 'My Orders'}</span>
            <span className="text-sm font-semibold text-text-primary">{hasActiveOrder && activeTab === 'active' ? '#ORD-4921' : (auth.currentUser?.displayName?.split(' ')[0] || 'User')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotificationModal(true)} className="relative p-2 text-text-secondary bg-bg-card rounded-full shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Segmented Control */}
      <div className="px-6 py-4 z-10 relative bg-bg-main border-b border-border-color">
        <div className="flex bg-bg-elevated p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'active' ? 'bg-bg-card text-accent-primary shadow-sm' : 'text-text-secondary'}`}
          >
            Active Orders
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-bg-card text-accent-primary shadow-sm' : 'text-text-secondary'}`}
          >
            Order History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        {activeTab === 'active' ? (
          /* Active Order Tab */
          !hasActiveOrder ? (
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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center pt-8 pb-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {paymentMethod === 'cash' ? 'Order Confirmed!' : 'Payment Authorized!'}
                </h2>
                <p className="text-sm text-text-secondary max-w-[250px]">
                  {isScheduled 
                    ? `Your booking is confirmed. Pickup is scheduled for tomorrow at ${activeOrderDetails?.time}.` 
                    : 'Your booking is confirmed. Our driver will be there soon.'}
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

              {/* Demo Button to trigger Feedback */}
              <button 
                onClick={() => setShowFeedbackModal(true)}
                className="mt-6 w-full py-4 rounded-xl font-semibold bg-accent-primary text-white shadow-[0_4px_16px_var(--color-accent-glow)] active:scale-[0.98] transition-transform"
              >
                Simulate Delivery & Feedback
              </button>
            </div>
          )
        ) : (
          /* History Tab */
          <div className="pt-6 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {mockPastOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedPastOrder(order)}
                className="bg-bg-card border border-border-color rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-accent-primary block mb-1">{order.id}</span>
                    <h4 className="text-sm font-bold text-text-primary">{order.provider}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-border-color pt-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">{order.date}</p>
                    <p className="text-xs font-medium text-text-primary">{order.items}</p>
                  </div>
                  <div className="flex items-center text-text-primary font-bold">
                    {order.total}
                    <ChevronRight className="w-4 h-4 ml-1 text-text-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Order Details Modal */}
      {selectedPastOrder && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-bg-card w-full rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary">{selectedPastOrder.provider}</h3>
                <p className="text-sm text-text-secondary">{selectedPastOrder.date} • {selectedPastOrder.id}</p>
              </div>
              <button onClick={() => setSelectedPastOrder(null)} className="text-text-secondary bg-bg-elevated p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-bg-elevated rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-4 text-accent-primary font-semibold border-b border-border-color pb-4">
                <Receipt className="w-5 h-5" />
                Receipt Breakdown
              </div>
              
              <div className="space-y-3 mb-4">
                {selectedPastOrder.details.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="text-text-primary font-medium">{item.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center border-t border-border-color pt-4">
                <span className="font-bold text-text-primary">Total Paid</span>
                <span className="text-xl font-bold text-accent-primary">{selectedPastOrder.total}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedPastOrder(null);
                onNavigate('home');
              }}
              className="w-full py-4 rounded-xl font-semibold bg-bg-elevated text-text-primary shadow-sm active:scale-[0.98] transition-transform border border-border-color"
            >
              Reorder from {selectedPastOrder.provider}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-bg-card w-full rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Rate Your Experience</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-text-secondary bg-bg-elevated p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-10 h-10 cursor-pointer ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-text-secondary'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              
              <textarea 
                placeholder="Leave a comment for the provider (optional)" 
                className="w-full bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary min-h-[100px] mb-6 resize-none"
              ></textarea>
              
              <button 
                onClick={() => {
                  setShowFeedbackModal(false);
                  setRating(0);
                }}
                className="w-full py-4 rounded-xl font-semibold bg-accent-primary text-white shadow-[0_4px_16px_var(--color-accent-glow)] active:scale-[0.98] transition-transform"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color flex justify-around p-4 pb-8 z-20">
        <button onClick={() => onNavigate('home')} className="text-text-secondary"><Home className="w-6 h-6" /></button>
        <button className="text-accent-primary"><FileText className="w-6 h-6" /></button>
        <button onClick={() => onNavigate('profile')} className="text-text-secondary"><User className="w-6 h-6" /></button>
      </nav>
    </div>
  );
}
