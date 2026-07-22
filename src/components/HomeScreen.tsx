import { useState } from 'react';
import { Search, Home, FileText, Bell, User, X, Percent, Tag, Gift } from 'lucide-react';
import type { ScreenName } from '../App';
import { providersData } from '../lib/mockData';
import { auth } from '../lib/firebase';

interface HomeProps {
  onNavigate: (screen: ScreenName) => void;
  onSelectProvider: (id: string, serviceHint?: string) => void;
  userCity?: string;
}

export default function HomeScreen({ onNavigate, onSelectProvider, userCity }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDiscountsModal, setShowDiscountsModal] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning,' : hour < 18 ? 'Good Afternoon,' : 'Good Evening,';

  const services = [
    { name: 'Wash', icon: '👕' },
    { name: 'Iron', icon: '👔' },
    { name: 'Dry Clean', icon: '🧥' }
  ];

  const discounts = [
    { code: 'FIRST50', title: '50% Off First Order', desc: 'Get 50% off up to ₹100 on your very first laundry booking.', badge: 'Welcome Deal' },
    { code: 'PURESTUDENT', title: 'Student Bundle Saver', desc: 'Flat ₹150 off on monthly student laundry packages above 15kg.', badge: 'Package Deal' },
    { code: 'WEEKEND30', title: '30% Off Express Ironing', desc: 'Save 30% on all Steam Ironing bookings placed on weekends.', badge: 'Weekend Offer' }
  ];

  const handleServiceClick = (serviceName: string) => {
    setActiveService(activeService === serviceName ? null : serviceName);
  };

  const filteredProviders = providersData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = activeService ? p.services.includes(activeService) : true;
    const matchesCity = userCity ? p.address.toLowerCase().includes(userCity.toLowerCase()) : true;
    return matchesSearch && matchesService && matchesCity;
  });

  return (
    <div className="flex flex-col h-full w-full bg-bg-main relative">
      {/* Notifications Modal */}
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

      {/* Discounts Modal */}
      {showDiscountsModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-bg-card w-full max-h-[80%] rounded-t-3xl p-6 pb-12 overflow-y-auto animate-in slide-in-from-bottom-8 no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Percent className="w-6 h-6 text-accent-primary" />
                <h3 className="text-xl font-bold text-text-primary">Discounts & Offers</h3>
              </div>
              <button onClick={() => setShowDiscountsModal(false)} className="text-text-secondary bg-bg-elevated p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {discounts.map(d => (
                <div key={d.code} className="bg-bg-elevated border border-border-color p-4 rounded-2xl relative shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider bg-accent-primary/10 px-2.5 py-1 rounded-full">{d.badge}</span>
                    <span className="text-xs font-mono font-bold text-text-primary bg-bg-card px-2 py-1 rounded border border-border-color/50">{d.code}</span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary mb-1">{d.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-bg-main">
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
            <span className="text-xs text-text-secondary">{greeting}</span>
            <span className="text-sm font-semibold text-text-primary">
              {auth.currentUser?.displayName ? auth.currentUser.displayName.split(' ')[0] : 'User'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotificationModal(true)} className="relative p-2 text-text-secondary bg-bg-card rounded-full shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-bg-elevated px-4 py-3.5 rounded-xl mb-6 shadow-sm border border-border-color">
          <Search className="w-5 h-5 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search providers by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-sm text-text-primary w-full outline-none"
          />
        </div>

        {/* Services */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Services Provided</h3>
        </div>
        <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
          {services.map(s => {
            const isActive = activeService === s.name;
            return (
              <div 
                key={s.name}
                onClick={() => handleServiceClick(s.name)}
                className={`min-w-[90px] p-4 rounded-2xl flex flex-col items-center gap-3 cursor-pointer transition-all border shadow-sm ${
                  isActive 
                    ? 'bg-[rgba(0,231,210,0.1)] dark:bg-[rgba(0,231,210,0.1)] border-accent-primary shadow-[0_8px_16px_var(--color-accent-glow)]' 
                    : 'bg-bg-card border-border-color'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isActive ? 'bg-[rgba(0,231,210,0.2)] dark:bg-[rgba(0,231,210,0.2)]' : 'bg-bg-elevated'}`}>
                  {s.icon}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-accent-primary' : 'text-text-secondary'}`}>{s.name}</span>
              </div>
            );
          })}
        </div>

        {/* Discounts Banner Bar */}
        <div 
          onClick={() => setShowDiscountsModal(true)}
          className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-accent-primary/20 via-accent-primary/10 to-transparent border border-accent-primary/30 flex items-center justify-between cursor-pointer shadow-sm hover:border-accent-primary transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold">
              %
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary">Special Discounts & Offers</h4>
              <p className="text-[11px] text-text-secondary">Save up to 50% on student bundles & packages</p>
            </div>
          </div>
          <span className="text-xs font-bold text-accent-primary">View →</span>
        </div>

        {/* Providers List */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Near You</h3>
        </div>
        <div className="flex flex-col gap-4">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-10 bg-bg-elevated rounded-2xl border border-border-color">
              <div className="text-4xl mb-3">📍</div>
              <h4 className="text-text-primary font-bold mb-1">No providers found</h4>
              <p className="text-text-secondary text-sm">
                We're not active in {userCity ? <span className="text-accent-primary font-semibold">{userCity}</span> : 'this area'} yet.
              </p>
            </div>
          ) : (
            filteredProviders.map(provider => (
              <div 
                key={provider.id}
                onClick={() => {
                  onSelectProvider(provider.id, activeService === 'Iron' ? 'Iron' : activeService === 'Dry Clean' ? 'DryClean' : undefined);
                  onNavigate('provider');
                }}
                className="bg-bg-card border border-border-color rounded-3xl p-5 flex gap-5 items-start cursor-pointer active:scale-[0.98] transition-transform shadow-sm hover:border-action-primary/30"
              >
                <div className="w-[75px] h-[75px] shrink-0 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-2xl text-accent-primary font-bold shadow-inner">
                  {provider.image}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <h4 className="text-[15px] font-bold text-text-primary mb-1.5 leading-tight">{provider.name}</h4>
                  <p className="text-[13px] text-text-secondary mb-3 leading-snug line-clamp-2">{provider.address}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-[12px] font-bold text-amber-500 flex items-center gap-1.5">
                      ⭐ {provider.rating} <span className="text-text-muted font-normal">| {provider.turnaroundTime || '24–48 hrs'}</span>
                    </span>
                    <span className="text-[15px] font-extrabold text-accent-primary leading-none">₹{provider.pricePerKg}/kg</span>
                  </div>
                </div>
              </div>
            ))
          )}
          {filteredProviders.length === 1 && (
            <div className="text-center py-4 text-xs font-medium text-text-secondary mt-2 opacity-80">
              More trusted laundry partners are coming soon.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color flex justify-around p-4 pb-8 z-20">
        <button className="text-accent-primary"><Home className="w-6 h-6" /></button>
        <button onClick={() => onNavigate('tracking')} className="text-text-secondary"><FileText className="w-6 h-6" /></button>
        <button onClick={() => onNavigate('profile')} className="text-text-secondary"><User className="w-6 h-6" /></button>
      </nav>
    </div>
  );
}
