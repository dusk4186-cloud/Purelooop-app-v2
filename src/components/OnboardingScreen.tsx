import { Sparkles } from 'lucide-react';
import type { ScreenName } from '../App';

export default function OnboardingScreen({ onNavigate }: { onNavigate: (screen: ScreenName) => void }) {
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
        </div>
      </div>
    </div>
  );
}
