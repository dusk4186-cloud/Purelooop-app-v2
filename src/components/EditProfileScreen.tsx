import { useState } from 'react';
import { ArrowLeft, Edit2, User, Mail, Phone, CheckCircle2 } from 'lucide-react';
import type { ScreenName } from '../App';
import { auth } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import ErrorBanner from './ErrorBanner';

interface EditProfileProps {
  onNavigate: (screen: ScreenName) => void;
}

export default function EditProfileScreen({ onNavigate }: EditProfileProps) {
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210'); // Simulated local state
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSaving(true);
    setError('');
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: name
      });
      // Email updates in Firebase require re-authentication, so we'll just simulate it here
      // Phone is also kept in local state for the prototype
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary">
      <header className="p-6 pt-12 flex items-center bg-bg-primary">
        <button 
          onClick={() => onNavigate('profile')} 
          className="text-text-primary p-2 -ml-2 mr-4 rounded-full hover:bg-bg-elevated active:scale-95 focus-visible:outline-none transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-text-primary">Edit Profile</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mt-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-action-primary p-1 bg-bg-card shadow-sm">
              {auth.currentUser?.photoURL ? (
                <img 
                  src={auth.currentUser.photoURL} 
                  alt="User Profile" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover bg-bg-elevated" 
                />
              ) : (
                <div className="w-full h-full rounded-full bg-action-primary/10 flex items-center justify-center text-action-primary text-4xl font-bold">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            {/* Edit Badge Overlay */}
            <button 
              className="absolute bottom-0 right-0 p-2 bg-action-primary text-white rounded-full border-2 border-bg-primary shadow-sm hover:brightness-110 active:scale-95 focus-visible:outline-none transition-all"
              aria-label="Edit Profile Photo"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner type="error" title="Update Failed" message={error} onDismiss={() => setError('')} />
          </div>
        )}
        
        {isSuccess && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-secondary ml-1 flex items-center gap-2">
              <User className="w-4 h-4 opacity-70" /> Full Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="w-full p-4 rounded-xl bg-bg-elevated border border-border-color text-base text-text-primary placeholder:text-text-muted focus-visible:outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-colors disabled:opacity-50"
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-secondary ml-1 flex items-center gap-2">
              <Mail className="w-4 h-4 opacity-70" /> Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full p-4 rounded-xl bg-bg-elevated border border-border-color text-base text-text-primary placeholder:text-text-muted focus-visible:outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-colors disabled:opacity-50"
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-secondary ml-1 flex items-center gap-2">
              <Phone className="w-4 h-4 opacity-70" /> Phone Number
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 00000 00000"
              required
              className="w-full p-4 rounded-xl bg-bg-elevated border border-border-color text-base text-text-primary placeholder:text-text-muted focus-visible:outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-colors disabled:opacity-50"
              disabled={isSaving}
            />
          </div>

          <div className="pt-8">
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full py-4 rounded-xl font-bold bg-action-primary text-white hover:brightness-105 active:scale-[0.98] transition-all shadow-[0_4px_16px_var(--color-accent-glow)] disabled:bg-border-color disabled:text-text-secondary disabled:scale-100 disabled:shadow-none focus-visible:outline-none"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
