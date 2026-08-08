import { Home, FileText, User } from 'lucide-react';
import type { ScreenName } from '../App';

interface Props {
  activeScreen: 'home' | 'tracking' | 'profile';
  onNavigate: (screen: ScreenName) => void;
  hasActiveOrder?: boolean;
}

export default function BottomNav({ activeScreen, onNavigate, hasActiveOrder = false }: Props) {
  return (
    <nav className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color flex justify-around items-center py-2.5 px-4 pb-7 z-20 shadow-lg">
      {/* Home */}
      <button 
        onClick={() => onNavigate('home')} 
        className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
          activeScreen === 'home' ? 'text-accent-primary font-bold' : 'text-text-secondary hover:text-text-primary font-medium'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[12px] tracking-tight">Home</span>
      </button>

      {/* Orders / Tracking */}
      <button 
        onClick={() => onNavigate('tracking')} 
        className={`flex flex-col items-center gap-1 relative transition-all active:scale-95 ${
          activeScreen === 'tracking' ? 'text-accent-primary font-bold' : 'text-text-secondary hover:text-text-primary font-medium'
        }`}
      >
        <div className="relative">
          <FileText className="w-5 h-5" />
          {hasActiveOrder && (
            <span className="absolute -top-1 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-primary border-2 border-bg-main shadow-[0_0_8px_var(--color-accent-glow)]"></span>
            </span>
          )}
        </div>
        <span className="text-[12px] tracking-tight">Orders</span>
      </button>

      {/* Profile */}
      <button 
        onClick={() => onNavigate('profile')} 
        className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
          activeScreen === 'profile' ? 'text-accent-primary font-bold' : 'text-text-secondary hover:text-text-primary font-medium'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[12px] tracking-tight">Profile</span>
      </button>
    </nav>
  );
}
