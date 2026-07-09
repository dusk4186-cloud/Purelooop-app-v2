import { useState } from 'react';
import { ArrowLeft, MapPin, Edit3, Plus, Home, Briefcase, Building, Check } from 'lucide-react';
import type { ScreenName } from '../App';

interface AddressesProps {
  onNavigate: (screen: ScreenName) => void;
  userAddress: string;
  setUserAddress: (address: string) => void;
}

export default function AddressesScreen({ onNavigate, userAddress, setUserAddress }: AddressesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftAddress, setDraftAddress] = useState(userAddress);
  const [activeLabel, setActiveLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  const handleSave = () => {
    if (draftAddress.trim()) {
      setUserAddress(draftAddress);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setDraftAddress(userAddress);
    setIsEditing(false);
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
        <h3 className="text-xl font-bold text-text-primary flex-1">Saved Addresses</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        <p className="text-sm text-text-secondary mb-6">
          Manage your pickup and delivery locations for future orders.
        </p>

        {isEditing ? (
          <div className="bg-bg-card border border-action-primary rounded-xl p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-action-primary" /> Edit Address
            </h4>
            
            <div className="flex gap-2 mb-4">
              {['Home', 'Work', 'Other'].map(label => {
                const isSelected = activeLabel === label;
                const Icon = label === 'Home' ? Home : label === 'Work' ? Briefcase : Building;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveLabel(label as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected 
                        ? 'bg-action-primary/10 border-action-primary text-action-primary' 
                        : 'bg-bg-elevated border-border-color text-text-secondary hover:border-action-primary/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>

            <textarea 
              value={draftAddress}
              onChange={(e) => setDraftAddress(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-xl bg-bg-elevated border border-border-color text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-colors resize-none mb-4"
              placeholder="Enter your full address..."
              autoFocus
            />

            <div className="flex gap-3">
              <button 
                onClick={cancelEdit}
                className="flex-1 py-3 rounded-xl font-semibold bg-bg-elevated text-text-primary border border-border-color hover:bg-border-color active:scale-95 transition-all focus-visible:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!draftAddress.trim()}
                className="flex-1 py-3 rounded-xl font-semibold bg-action-primary text-white hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_4px_12px_var(--color-accent-glow)] flex items-center justify-center gap-2 focus-visible:outline-none"
              >
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-bg-card border border-action-primary/20 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-action-primary/40 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-action-primary"></div>
              <div className="flex justify-between items-start mb-2 ml-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-action-primary/10 rounded-lg text-action-primary">
                    {activeLabel === 'Home' ? <Home className="w-4 h-4" /> : activeLabel === 'Work' ? <Briefcase className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">{activeLabel}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-action-primary text-white text-[10px] font-bold tracking-wider uppercase">Default</span>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 -m-2 text-action-primary opacity-80 hover:opacity-100 hover:bg-action-primary/10 rounded-full transition-all focus-visible:outline-none"
                  aria-label="Edit Address"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed ml-2 pr-4">
                {userAddress}
              </p>
            </div>

            {/* Add New Button Placeholder */}
            <button className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-border-color text-text-secondary hover:text-action-primary hover:border-action-primary hover:bg-action-primary/5 transition-all focus-visible:outline-none focus-visible:border-action-primary active:scale-[0.98]">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">Add New Address</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
