import { useState } from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import type { ScreenName } from '../App';

interface Props {
  onNavigate: (screen: ScreenName) => void;
  setUserCity?: (city: string) => void;
}

const CITIES = ['Bengaluru', 'Hyderabad', 'Noida'];

export default function OnboardingScreen({ onNavigate, setUserCity }: Props) {
  const [showCityPrompt, setShowCityPrompt] = useState(false);
  const [guestCity, setGuestCity] = useState('');
  return (
    <div className="flex flex-col h-full w-full bg-bg-main">
      <div className="flex-1 flex items-center justify-center bg-bg-elevated rounded-b-[40px]">
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full bg-bg-card border border-border-color" />
          <div className="absolute w-[70%] h-[70%] rounded-full bg-accent-glow backdrop-blur-md" />
          <Sparkles className="w-16 h-16 text-accent-primary relative z-10" />
        </div>
      </div>
      
      <div className="p-8 text-center flex-1 flex flex-col justify-end">
        <h2 className="text-3xl font-bold text-text-primary mb-3">Premium Care For Your Clothes</h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          Experience hassle-free, professional laundry services at your doorstep.
        </p>
        
        {showCityPrompt ? (
          <div className="flex flex-col gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 text-left">
            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-action-primary" /> Select your city
            </h3>
            <select 
              value={guestCity}
              onChange={(e) => setGuestCity(e.target.value)}
              className="w-full p-4 rounded-xl bg-bg-elevated border border-border-color text-sm text-text-primary focus:border-action-primary focus:ring-1 focus:ring-action-primary outline-none transition-colors appearance-none"
            >
              <option value="" disabled>Choose a city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={() => {
                if (guestCity && setUserCity) {
                  setUserCity(guestCity);
                  onNavigate('home');
                }
              }}
              disabled={!guestCity}
              className="w-full py-4 rounded-xl font-semibold bg-action-primary text-white disabled:opacity-50 transition-all mt-2"
            >
              Start Browsing
            </button>
            <button 
              onClick={() => setShowCityPrompt(false)}
              className="text-sm font-semibold text-text-secondary mt-2"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full py-4 rounded-xl font-semibold bg-accent-primary text-white shadow-[0_4px_16px_var(--color-accent-glow)] active:scale-95 transition-transform"
            >
              Get Started
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full py-4 rounded-xl font-semibold border-2 border-accent-primary text-accent-primary active:scale-95 transition-transform"
            >
              Log In
            </button>
            <button 
              onClick={() => setShowCityPrompt(true)}
              className="w-full py-2 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
