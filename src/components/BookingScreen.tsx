import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Edit3, Plus, X } from 'lucide-react';
import type { ScreenName } from '../App';
import { providersData } from '../lib/mockData';

interface BookingScreenProps {
  providerId: string | null;
  onNavigate: (screen: ScreenName) => void;
  onBookingComplete?: (details: {date: string, time: string}) => void;
  userAddress?: string;
  cartItems: any;
  setCartItems: any;
  activeServices: string[];
  setActiveServices: any;
  customItems: {name: string, qty: number}[];
  setCustomItems: any;
  setBookingTotal: any;
}

export default function BookingScreen({ 
  providerId, 
  onNavigate, 
  onBookingComplete, 
  userAddress = "42 Laundry St, Block B, 2nd Floor",
  cartItems: items,
  setCartItems: setItems,
  activeServices,
  setActiveServices,
  customItems,
  setCustomItems,
  setBookingTotal
}: BookingScreenProps) {
  const provider = providersData.find(p => p.id === providerId) || providersData[0];
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCustomItemName, setNewCustomItemName] = useState('');

  const toggleService = (service: string) => {
    setActiveServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const updateQty = (key: keyof typeof items, delta: number) => {
    setItems(prev => {
      const newQty = Math.max(0, prev[key].qty + delta);
      return { ...prev, [key]: { ...prev[key], qty: newQty } };
    });
  };

  const updateCustomQty = (index: number, delta: number) => {
    setCustomItems(prev => {
      const updated = [...prev];
      updated[index].qty = Math.max(0, updated[index].qty + delta);
      return updated;
    });
  };

  const addCustomItem = () => {
    if (newCustomItemName.trim()) {
      setCustomItems(prev => [...prev, { name: newCustomItemName.trim(), qty: 1 }]);
      setNewCustomItemName('');
      setShowCustomInput(false);
    }
  };

  const removeCustomItem = (index: number) => {
    setCustomItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalWeight = Object.values(items).reduce((acc: number, item: any) => acc + (item.qty * item.weight), 0);
  
  const multiplierMap: Record<string, number> = {
    'Wash': 1.0,
    'Iron': 1.5,
    'Dry Clean': 2.0
  };
  
  const maxMultiplier = activeServices.length > 0 
    ? Math.max(...activeServices.map(service => multiplierMap[service] || 1.0))
    : 0;
    
  const baseServiceCost = provider.pricePerKg * maxMultiplier;
  
  const customItemsQty = customItems.reduce((acc: number, item: any) => acc + item.qty, 0);
  
  const totalPrice = Math.round((totalWeight * baseServiceCost) + (customItemsQty * 40));

  useEffect(() => {
    setBookingTotal(totalPrice);
  }, [totalPrice, setBookingTotal]);

  const [activeTime, setActiveTime] = useState('09:00 AM');
  const [activeDate, setActiveDate] = useState<'Today' | 'Tomorrow'>('Today');

  // Helper to check if a time slot is available
  const isTimeSlotAvailable = (timeString: string) => {
    if (activeDate === 'Tomorrow') return true;
    
    // Convert timeString (e.g. '02:00 PM') to 24h hour
    const match = timeString.match(/(\d+):(\d+)\s+(AM|PM)/);
    if (!match) return true;
    
    let hour = parseInt(match[1]);
    const ampm = match[3];
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const currentHour = new Date().getHours();
    // Disable if current hour is greater than or equal to the slot hour
    return currentHour < hour;
  };

  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
  
  useEffect(() => {
    if (activeDate === 'Today') {
      const hasAvailableSlots = timeSlots.some(t => isTimeSlotAvailable(t));
      if (!hasAvailableSlots) {
        setActiveDate('Tomorrow');
        setActiveTime('09:00 AM');
      } else if (!isTimeSlotAvailable(activeTime)) {
        // Switch to the first available time today
        const firstAvailable = timeSlots.find(t => isTimeSlotAvailable(t));
        if (firstAvailable) setActiveTime(firstAvailable);
      }
    }
  }, [activeDate, activeTime]);

  const categories = ['Top Wear', 'Bottom Wear', 'Traditional/Formal', 'Household'];

  return (
    <div className="flex flex-col h-full w-full bg-bg-main">
      <header className="p-6 pt-12 flex items-center bg-bg-main">
        <button onClick={() => onNavigate('provider')} className="text-text-primary p-2 -ml-2 mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">Booking Details</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        {/* Service Type */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Select Services</h3>
          <div className="flex gap-3">
            {[
              { id: 'Wash', label: 'Wash & Fold' },
              { id: 'Iron', label: 'Ironing' },
              { id: 'Dry Clean', label: 'Dry Clean' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => toggleService(tab.id)}
                className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold border transition-colors shadow-sm ${
                  activeServices.includes(tab.id)
                    ? 'bg-[rgba(0,231,210,0.1)] dark:bg-[rgba(0,231,210,0.1)] border-accent-primary text-accent-primary' 
                    : 'bg-bg-card border-border-color text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-bg-card border border-border-color rounded-xl flex flex-col gap-1">
            <p className="text-[11px] text-text-secondary"><strong className="text-text-primary font-semibold">Wash & Fold:</strong> Base Price (₹{provider.pricePerKg}/kg)</p>
            <p className="text-[11px] text-text-secondary"><strong className="text-text-primary font-semibold">Ironing:</strong> 1.5x Base Price (₹{Math.round(provider.pricePerKg * 1.5)}/kg)</p>
            <p className="text-[11px] text-text-secondary"><strong className="text-text-primary font-semibold">Dry Clean:</strong> 2.0x Base Price (₹{Math.round(provider.pricePerKg * 2.0)}/kg)</p>
          </div>
        </div>

        {/* Itemized Cart */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Add Items</h3>
            <button 
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-accent-primary flex items-center gap-1 text-xs font-semibold bg-accent-primary/10 px-3 py-1.5 rounded-full"
            >
              <Plus className="w-4 h-4" /> Custom Item
            </button>
          </div>

          {showCustomInput && (
            <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text" 
                value={newCustomItemName}
                onChange={e => setNewCustomItemName(e.target.value)}
                placeholder="e.g. Cushions" 
                className="flex-1 bg-bg-elevated border border-border-color rounded-xl p-3 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
              <button onClick={addCustomItem} className="px-4 bg-accent-primary text-white rounded-xl font-semibold text-sm">Add</button>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {customItems.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-accent-primary mb-3 uppercase tracking-wider">Custom Items (₹40/pc)</h4>
                <div className="flex flex-col gap-3">
                  {customItems.map((item, index) => (
                    <div key={`custom-${index}`} className="flex justify-between items-center bg-[rgba(0,231,210,0.05)] border border-accent-primary/20 p-3 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeCustomItem(index)} className="p-1 text-red-400 hover:bg-red-400/10 rounded-lg mr-1"><X className="w-4 h-4" /></button>
                        <h4 className="text-sm font-medium text-text-primary">{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateCustomQty(index, -1)} className="w-7 h-7 rounded-md bg-bg-elevated text-text-primary flex items-center justify-center font-bold shadow-sm">-</button>
                        <span className="w-4 text-center font-semibold text-text-primary">{item.qty}</span>
                        <button onClick={() => updateCustomQty(index, 1)} className="w-7 h-7 rounded-md bg-bg-elevated text-text-primary flex items-center justify-center font-bold shadow-sm">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categories.map(category => {
              const categoryItems = (Object.keys(items) as Array<keyof typeof items>).filter(key => items[key].category === category);
              
              return (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">{category}</h4>
                  <div className="flex flex-col gap-3">
                    {categoryItems.map(key => {
                      const item = items[key];
                      // Only show items that have qty > 0, plus a few common ones to keep UI clean
                      // To show all, just render them, but let's hide ones with 0 qty unless they are common
                      const isCommon = ['shirts', 'trousers', 'bedsheets', 'sarees'].includes(key);
                      if (item.qty === 0 && !isCommon) return null;

                      return (
                        <div key={key} className="flex justify-between items-center bg-bg-card border border-border-color p-3 rounded-xl shadow-sm">
                          <div>
                            <h4 className="text-sm font-medium text-text-primary">{item.name}</h4>
                            <p className="text-[11px] text-accent-primary">{item.weight} kg/pc</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQty(key, -1)}
                              className="w-7 h-7 rounded-md bg-bg-elevated text-text-primary flex items-center justify-center font-bold shadow-sm"
                            >
                              -
                            </button>
                            <span className="w-4 text-center font-semibold text-text-primary">{item.qty}</span>
                            <button 
                              onClick={() => updateQty(key, 1)}
                              className="w-7 h-7 rounded-md bg-bg-elevated text-text-primary flex items-center justify-center font-bold shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pickup Time */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Pickup Schedule</h3>
          </div>
          
          <div className="flex gap-2 mb-4 bg-bg-card p-1 rounded-lg border border-border-color">
            {['Today', 'Tomorrow'].map(date => (
              <button
                key={date}
                onClick={() => setActiveDate(date as 'Today' | 'Tomorrow')}
                className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${
                  activeDate === date 
                    ? 'bg-bg-elevated text-text-primary shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {date}
              </button>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {timeSlots.map(time => {
              const isAvailable = isTimeSlotAvailable(time);
              return (
                <button
                  key={time}
                  onClick={() => isAvailable && setActiveTime(time)}
                  disabled={!isAvailable}
                  className={`min-w-[100px] py-2.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors shadow-sm ${
                    !isAvailable
                      ? 'bg-bg-main border-border-color/50 text-text-muted opacity-50 cursor-not-allowed'
                      : activeTime === time 
                        ? 'bg-accent-primary border-accent-primary text-white' 
                        : 'bg-bg-card border-border-color text-text-secondary hover:border-accent-primary/50'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          {activeDate === 'Today' && !timeSlots.some(t => isTimeSlotAvailable(t)) && (
             <p className="text-[11px] text-accent-primary mt-2 flex items-center gap-1">
               * All time slots for today have passed. Automatically selecting tomorrow.
             </p>
          )}
        </div>

        {/* Address */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Pickup Address</h3>
          <div className="flex items-start gap-3 bg-bg-card border border-border-color shadow-sm p-4 rounded-xl relative">
            <MapPin className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-1">Home</h4>
              <p className="text-xs text-text-secondary leading-relaxed pr-8">
                {userAddress}
              </p>
            </div>
            <button className="absolute top-4 right-4 text-accent-primary text-xs font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color p-4 pb-8 z-20 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] text-text-secondary">Total Price</span>
          <span className="text-xl font-bold text-text-primary">₹{totalPrice}</span>
          <span className="text-[10px] text-accent-primary">Est. {totalWeight.toFixed(1)} kg</span>
        </div>
        <button 
          onClick={() => {
            if (onBookingComplete) onBookingComplete({ date: activeDate, time: activeTime });
            onNavigate('payment');
          }}
          disabled={totalPrice === 0 || activeServices.length === 0}
          className="flex-1 py-4 rounded-xl font-semibold bg-accent-primary text-white active:scale-[0.98] transition-transform shadow-[0_4px_16px_var(--color-accent-glow)] disabled:bg-border-color disabled:text-text-secondary disabled:scale-100 disabled:shadow-none"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
