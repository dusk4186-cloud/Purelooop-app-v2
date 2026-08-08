import { ArrowLeft, Star, MapPin, Phone, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import type { ScreenName } from '../App';
import { providersData } from '../lib/mockData';

interface ProviderProfileProps {
  providerId: string | null;
  onNavigate: (screen: ScreenName) => void;
  isGuest?: boolean;
}

export default function ProviderProfile({ providerId, onNavigate, isGuest }: ProviderProfileProps) {
  const provider = providersData.find(p => p.id === providerId) || providersData[0];
  
  const serviceLabels: Record<string, string> = {
    'WashFold': 'Washing (Wash & Fold)',
    'WashIron': 'Washing & Steam Ironing',
    'Iron': 'Steam Ironing Only',
    'DryClean': 'Dry Cleaning'
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-main">
      <header className="absolute top-0 left-0 w-full p-6 pt-12 flex items-center z-10">
        <button 
          onClick={() => onNavigate('home')} 
          className="text-text-primary p-2 rounded-full bg-bg-card/50 backdrop-blur-md border border-border-color shadow-sm"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Hero Section */}
        <div className="h-[220px] bg-gradient-to-b from-bg-elevated to-bg-main flex items-center justify-center relative">
          <div className="text-7xl font-bold text-accent-primary drop-shadow-[0_10px_20px_var(--color-accent-glow)]">
            {provider.image}
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 -mt-6 relative z-10 space-y-6">
          <div className="bg-bg-card border border-border-color rounded-2xl p-5 shadow-sm space-y-4">
            {/* Labeled Provider Name */}
            <div>
              <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">Service Provider Name</span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-xl font-bold text-text-primary">{provider.name}</h2>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-xs text-text-secondary border-t border-border-color/50 pt-3">
              <MapPin className="w-4 h-4 mt-0.5 text-accent-primary shrink-0" />
              <p>{provider.address}</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex justify-between bg-bg-card py-4 px-6 rounded-2xl border border-border-color shadow-sm">
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-base font-bold text-text-primary flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {provider.rating}
              </span>
              <span className="text-[11px] text-text-secondary">Rating</span>
            </div>
            <div className="w-[1px] bg-border-color" />
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-base font-bold text-accent-primary">₹{provider.pricePerKg}</span>
              <span className="text-[11px] text-text-secondary">Per Kg</span>
            </div>
            <div className="w-[1px] bg-border-color" />
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-base font-bold text-text-primary">{provider.turnaroundTime || '24h'}</span>
              <span className="text-[11px] text-text-secondary">Turnaround</span>
            </div>
          </div>

          {/* Contact No. */}
          <div className="bg-bg-card border border-border-color rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider block mb-1.5">Contact No.</span>
            <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                <Phone className="w-4 h-4" />
              </div>
              <span>{provider.contactNumber || '+91 98765 43210'}</span>
            </div>
          </div>

          {/* Services Offered */}
          <div className="bg-bg-card border border-border-color rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider block mb-2">Services</span>
            <div className="space-y-2">
              {provider.services.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="text-accent-primary font-bold">→</span>
                  <span>{serviceLabels[s] || s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-bg-card border border-border-color rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider block mb-1.5">Operating Hours</span>
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <Clock className="w-4 h-4 text-accent-primary shrink-0" />
              <span>{provider.operatingHours || '9:00 AM – 8:00 PM (All Days)'}</span>
            </div>
          </div>

          {/* Service Area */}
          <div className="bg-bg-card border border-border-color rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider block mb-2">Service Area</span>
            <div className="grid grid-cols-2 gap-2">
              {(provider.serviceArea || ['Madhapur', 'Jubilee Hills', 'Gachibowli', 'HITEC City']).map((area: string) => (
                <div key={area} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Navigation className="w-3 h-3 text-accent-primary shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color p-4 pb-8 z-20">
        <button 
          onClick={() => {
            if (isGuest) {
              onNavigate('signup');
            } else {
              onNavigate('booking');
            }
          }}
          className="w-full py-4 rounded-xl font-semibold bg-accent-primary text-white shadow-[0_4px_16px_var(--color-accent-glow)] active:scale-[0.98] transition-transform"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
