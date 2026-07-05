import { ArrowLeft, ChevronRight, LogOut, MapPin, CreditCard, Settings, HelpCircle, Moon, Sun, User, Bell, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ScreenName } from '../App';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface ProfileProps {
  onNavigate: (screen: ScreenName) => void;
}

export default function ProfileScreen({ onNavigate }: ProfileProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onNavigate('onboarding');
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const menuItems: { icon: any; label: string; route: ScreenName }[] = [
    { icon: <User className="w-5 h-5 text-text-secondary" />, label: 'Edit Profile', route: 'edit-profile' },
    { icon: <MapPin className="w-5 h-5 text-text-secondary" />, label: 'Saved Addresses', route: 'addresses' },
    { icon: <Bell className="w-5 h-5 text-text-secondary" />, label: 'Notification Toggles', route: 'settings' },
    { icon: <HelpCircle className="w-5 h-5 text-text-secondary" />, label: 'Help & Support', route: 'help' },
    { icon: <FileText className="w-5 h-5 text-text-secondary" />, label: 'Legal / Privacy', route: 'privacy' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bg-main">
      <header className="p-6 pt-12 flex items-center bg-bg-main">
        <button onClick={() => onNavigate('home')} className="text-text-primary p-2 -ml-2 mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">Profile</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        <div className="flex flex-col items-center gap-3 mb-8 pt-4">
          <div className="w-24 h-24 rounded-full border-4 border-accent-primary p-1 bg-bg-card">
            {auth.currentUser?.photoURL ? (
              <img 
                src={auth.currentUser.photoURL} 
                alt="User Profile" 
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover bg-bg-elevated" 
              />
            ) : (
              <div className="w-full h-full rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary text-4xl font-bold">
                {auth.currentUser?.displayName ? auth.currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <h4 className="text-xl font-bold text-text-primary">
            {auth.currentUser?.displayName || 'User'}
          </h4>
          <p className="text-sm text-text-secondary">
            {auth.currentUser?.email || 'No email connected'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Theme Toggle */}
          <div 
            onClick={toggleTheme}
            className="flex justify-between items-center p-4 bg-bg-card border border-border-color rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              <span className="text-sm font-medium text-text-primary">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${isDarkMode ? 'bg-accent-primary' : 'bg-border-color'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>

          {menuItems.map((item, i) => (
            <div 
              key={i}
              onClick={() => onNavigate(item.route)}
              className="flex justify-between items-center p-4 bg-bg-card border border-border-color rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="text-sm font-medium text-text-primary">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </div>
          ))}

          {/* Logout Button */}
          <div 
            onClick={handleLogout}
            className="flex justify-between items-center p-4 bg-bg-card border border-red-500/20 rounded-xl cursor-pointer active:scale-[0.98] transition-transform mt-4"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Log Out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
