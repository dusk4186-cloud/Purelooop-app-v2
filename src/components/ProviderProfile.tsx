import { ArrowLeft, Star, MapPin } from 'lucide-react';
import type { ScreenName } from '../App';
import { providersData } from '../lib/mockData';

interface ProviderProfileProps {
  providerId: string | null;
  onNavigate: (screen: ScreenName) => void;
  isGuest?: boolean;
}

export default function ProviderProfile({ providerId, onNavigate, isGuest }: ProviderProfileProps) {
  const provider = providersData.find(p => p.id === providerId) || providersData[0];
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
        <div className="h-[250px] bg-gradient-to-b from-bg-elevated to-bg-main flex items-center justify-center relative">
          <div className="text-7xl font-bold text-accent-primary drop-shadow-[0_10px_20px_var(--color-accent-glow)]">
            {provider.image}
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 -mt-6 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-text-primary">{provider.name}</h2>
            <div className="w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center text-white text-xs">✓</div>
          </div>
          
          <div className="flex items-start gap-1.5 text-sm text-text-secondary mb-6">
            <MapPin className="w-4 h-4 mt-0.5" />
            <p>{provider.address}</p>
          </div>

          <div className="flex justify-between bg-bg-card py-4 px-6 rounded-2xl border border-border-color shadow-sm mb-6">
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
              <span className="text-base font-bold text-text-primary">24h</span>
              <span className="text-[11px] text-text-secondary">Delivery</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold text-text-primary mb-2">About</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {provider.about}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color p-4 pb-12 z-20">
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
