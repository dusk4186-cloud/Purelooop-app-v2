import { useState } from 'react';
import { ArrowLeft, MapPin, Edit3, Plus, Home, Briefcase, Building, Check, Save } from 'lucide-react';
import type { ScreenName } from '../App';

interface AddressesProps {
  onNavigate: (screen: ScreenName) => void;
  userAddress: string;
  setUserAddress: (address: string) => void;
  userCity: string;
  setUserCity: (city: string) => void;
}

const CITIES = [
  'Bengaluru', 'Hyderabad', 'Noida'
];

export default function AddressesScreen({ onNavigate, userAddress, setUserAddress, userCity, setUserCity }: AddressesProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const getInitial = (type: string) => {
    if (!userAddress) return '';
    if (type === 'pin') {
      const match = userAddress.match(/\d{6}/);
      return match ? match[0] : '';
    }
    const parts = userAddress.split(',');
    if (type === 'house') return parts[0] ? parts[0].trim() : '';
    if (type === 'street') return parts[1] ? parts[1].trim() : '';
    return '';
  };

  const [city, setCity] = useState(userCity || 'Bengaluru');
  const [pincode, setPincode] = useState(getInitial('pin'));
  const [house, setHouse] = useState(getInitial('house'));
  const [street, setStreet] = useState(getInitial('street'));
  const [landmark, setLandmark] = useState('');
  const [activeLabel, setActiveLabel] = useState<'Home' | 'Work' | 'Hostel' | 'PG'>('Home');
  const [saveAddress, setSaveAddress] = useState(true);

  const isValidPincode = (city: string, pin: string) => {
    if (pin.length !== 6) return false;
    if (city === 'Bengaluru' && !pin.startsWith('560')) return false;
    if (city === 'Noida' && !pin.startsWith('201')) return false;
    if (city === 'Hyderabad' && !(pin.startsWith('500') || pin.startsWith('501'))) return false;
    return true;
  };
  
  const pinValid = pincode.length === 0 || isValidPincode(city, pincode);

  const handleSave = () => {
    if (!city || !pincode || !house || !street || !isValidPincode(city, pincode)) return; 
    
    const formattedAddress = `${house}, ${street}${landmark ? `, Near ${landmark}` : ''}, ${city} - ${pincode}`;
    
    if (saveAddress) {
      setUserAddress(formattedAddress);
      setUserCity(city);
    }
    
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary">
      <header className="p-6 pt-12 flex items-center bg-bg-primary">
        <button 
          onClick={() => onNavigate('profile')} 
          className="text-text-primary p-2 -ml-2 mr-4 rounded-full hover:bg-bg-elevated active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-text-primary flex-1">Pickup Address</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        <p className="text-sm text-text-secondary mb-6">
          Set your pickup location for seamless matching with local providers.
        </p>

        {isEditing ? (
          <div className="bg-bg-card border border-action-primary rounded-xl p-5 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-action-primary" /> Enter Address Details
            </h4>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">City *</label>
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated border border-border-color text-sm text-text-primary focus:border-action-primary focus:ring-1 focus:ring-action-primary outline-none transition-colors appearance-none"
                >
                  <option value="" disabled>Select City</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option disabled>---</option>
                  <option disabled>We're working to expand to your area. Check back soon!</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Pincode *</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className={`w-full p-3 rounded-xl bg-bg-elevated border text-sm text-text-primary focus:ring-1 outline-none ${!pinValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-color focus:border-action-primary focus:ring-action-primary'}`}
                  placeholder="e.g. 560001"
                />
                {!pinValid && (
                  <p className="text-[10px] text-red-500 mt-1">Invalid pincode for {city}.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">House/Flat No. & Building *</label>
                <input 
                  type="text" 
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated border border-border-color text-sm text-text-primary focus:border-action-primary focus:ring-1 outline-none"
                  placeholder="e.g. Flat 402, Royal Residency"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Street / Area / Locality *</label>
                <input 
                  type="text" 
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated border border-border-color text-sm text-text-primary focus:border-action-primary focus:ring-1 outline-none"
                  placeholder="e.g. MG Road, Indiranagar"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Landmark (Optional)</label>
                <input 
                  type="text" 
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated border border-border-color text-sm text-text-primary focus:border-action-primary focus:ring-1 outline-none"
                  placeholder="e.g. Opposite Metro Station"
                />
              </div>
            </div>

            <label className="block text-xs font-medium text-text-secondary mb-3 mt-4">Save As</label>
            <div className="flex flex-wrap gap-3 mb-8">
              {['Home', 'Work', 'Hostel', 'PG'].map(label => {
                const isSelected = activeLabel === label;
                const Icon = label === 'Home' ? Home : label === 'Work' ? Briefcase : Building;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveLabel(label as any)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
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

            <div className="flex items-center gap-3 mb-8">
              <input 
                type="checkbox" 
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="w-4 h-4 rounded border-border-color text-action-primary focus:ring-action-primary bg-bg-elevated"
              />
              <label htmlFor="saveAddress" className="text-sm text-text-primary cursor-pointer">
                Save this address for future orders
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={cancelEdit}
                className="flex-1 py-3 rounded-xl font-semibold bg-bg-elevated text-text-primary border border-border-color hover:bg-border-color active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!city || !pincode || !house || !street || !isValidPincode(city, pincode)}
                className="flex-1 py-3 rounded-xl font-semibold bg-action-primary text-white hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center shadow-[0_4px_12px_var(--color-accent-glow)]"
              >
                Save Address
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-bg-card border border-action-primary/20 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-action-primary/40 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-action-primary"></div>
              <div className="flex justify-between items-start mb-3 ml-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-action-primary/10 rounded-lg text-action-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">{activeLabel || 'Current Address'}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-action-primary text-white text-[10px] font-bold tracking-wider uppercase">Active</span>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 -m-2 text-action-primary opacity-80 hover:opacity-100 hover:bg-action-primary/10 rounded-full transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed ml-2 pr-4">
                {userAddress}
              </p>
            </div>

            <button onClick={() => {
              setHouse(''); setStreet(''); setLandmark(''); setPincode('');
              setIsEditing(true);
            }} className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-border-color text-text-secondary hover:text-action-primary hover:border-action-primary hover:bg-action-primary/5 transition-all active:scale-[0.98]">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">Add New Address</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
