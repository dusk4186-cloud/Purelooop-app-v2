import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Banknote, CheckCircle2 } from 'lucide-react';
import type { ScreenName } from '../App';
import { providersData } from '../lib/mockData';

interface PaymentScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onPaymentSuccess?: (method: string) => void;
  bookingTotal: number;
  cartItemsByService?: Record<string, any>;
  customItemsByService?: Record<string, {name: string, qty: number}[]>;
  providerId?: string | null;
}

export default function PaymentScreen({ 
  onNavigate, 
  onPaymentSuccess, 
  bookingTotal,
  cartItemsByService = {},
  customItemsByService = {},
  providerId
}: PaymentScreenProps) {
  const [activeMethod, setActiveMethod] = useState('card');
  const [detergent, setDetergent] = useState('standard');
  const [softener, setSoftener] = useState(false);
  
  const provider = providersData.find(p => p.id === providerId) || providersData[0];

  const detergentCost = detergent === 'premium' ? 30 : detergent === 'hypoallergenic' ? 40 : 0;
  const softenerCost = softener ? 20 : 0;
  const preferencesCost = detergentCost + softenerCost;
  const finalTotal = bookingTotal + preferencesCost;
  const holdAmount = Math.round(finalTotal * 0.15);
  const authorizationTotal = finalTotal + holdAmount;

  const paymentMethods = [
    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5 text-text-secondary" /> },
    { 
      id: 'gpay', 
      name: 'Google Pay', 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-4 object-contain" /> 
    },
    { 
      id: 'phonepe', 
      name: 'PhonePe', 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-5 object-contain" /> 
    },
    { id: 'cash', name: 'Cash on Delivery', icon: <Banknote className="w-5 h-5 text-text-secondary" /> },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bg-main">
      <header className="p-6 pt-12 flex items-center bg-bg-main">
        <button onClick={() => onNavigate('booking')} className="text-text-primary p-2 -ml-2 mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">Payment</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="text-center py-8 pb-4">
          <p className="text-sm text-text-secondary mb-1">Authorization Amount</p>
          <h2 className="text-4xl font-extrabold text-accent-primary">₹{authorizationTotal.toFixed(2)}</h2>
        </div>

        {/* Wash Preferences Add-ons */}
        <div className="bg-bg-card border border-border-color rounded-xl p-4 mb-6 shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Wash Preferences</h4>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">Detergent</label>
            <select 
              value={detergent}
              onChange={(e) => setDetergent(e.target.value)}
              className="w-full bg-bg-elevated border border-border-color rounded-lg p-3 text-sm text-text-primary outline-none focus:border-accent-primary"
            >
              <option value="standard">Standard Eco-Wash (Included)</option>
              <option value="premium">Premium Fragrance (+₹30)</option>
              <option value="hypoallergenic">Hypoallergenic (+₹40)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-color">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">Add Fabric Softener?</span>
              <span className="text-xs text-text-secondary">+₹20 per order</span>
            </div>
            <button 
              onClick={() => setSoftener(!softener)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${softener ? 'bg-accent-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${softener ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Order Review Summary */}
        <div className="bg-bg-card border border-border-color rounded-xl p-4 mb-6 shadow-sm flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Order Summary</h4>
          
          {Object.keys(cartItemsByService).map(serviceId => {
            const tabItems = cartItemsByService[serviceId] ?? {};
            const tabCustomItems = customItemsByService[serviceId] ?? [];
            
            let pileTotal = 0;
            let labelText = '';
            
            if (serviceId === 'DryClean') {
              const itemCost = Object.values(tabItems).reduce((acc: number, item: any) => acc + (item.qty * (item.dryCleanPrice || 99)), 0);
              const customCost = tabCustomItems.reduce((acc: number, item: any) => acc + (item.qty * 150), 0);
              pileTotal = itemCost + customCost;
              const piecesCount = Object.values(tabItems).reduce((acc: number, item: any) => acc + item.qty, 0) + tabCustomItems.reduce((acc: number, item: any) => acc + item.qty, 0);
              if (piecesCount === 0) return null;
              labelText = `Dry Clean Pile (${piecesCount} pieces)`;
            } else {
              const weight = Object.values(tabItems).reduce((acc: number, item: any) => acc + (item.qty * item.weight), 0);
              const rate = provider.serviceRates[serviceId] || 80;
              const customQty = tabCustomItems.reduce((acc: number, item: any) => acc + item.qty, 0);
              pileTotal = Math.round(weight * rate) + (customQty * 40);
              if (weight === 0 && customQty === 0) return null;
              
              const serviceName = serviceId === 'WashFold' ? 'Wash & Fold' : serviceId === 'WashIron' ? 'Wash & Iron' : 'Iron Only';
              labelText = `${serviceName} Pile (${weight > 0 ? weight.toFixed(1) + ' kg' : customQty + ' pieces'})`;
            }
            
            return (
              <div key={serviceId} className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">{labelText}</span>
                <span className="text-sm font-semibold text-text-primary">₹{pileTotal}</span>
              </div>
            );
          })}
          
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-border-color">
             <span className="text-sm font-medium text-text-secondary">Pickup & Delivery</span>
             <span className="text-sm font-semibold text-accent-primary">Free</span>
          </div>
          {preferencesCost > 0 && (
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-border-color">
               <span className="text-sm font-medium text-text-secondary">Wash Add-ons</span>
               <span className="text-sm font-semibold text-text-primary">+₹{preferencesCost}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 mt-1 border-t border-border-color">
             <span className="text-sm font-medium text-text-secondary">Est. Subtotal</span>
             <span className="text-sm font-semibold text-text-primary">₹{finalTotal}</span>
          </div>
          <div className="flex justify-between items-center pt-2 text-amber-600/90 dark:text-amber-500/90">
             <span className="text-sm font-medium">Buffer Hold (~15%)</span>
             <span className="text-sm font-semibold">+₹{holdAmount}</span>
          </div>
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-border-color">
             <span className="text-sm font-bold text-text-primary">Total Authorized</span>
             <span className="text-sm font-bold text-accent-primary">₹{authorizationTotal}</span>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-8 flex items-start gap-3">
          <span className="text-amber-500 text-lg mt-[-2px]">ℹ️</span>
          <p className="text-[11px] text-text-secondary leading-snug">
            A temporary authorization hold slightly higher (~15%) than your estimate is placed to accommodate final weight variances. You will only be charged the true final amount.
          </p>
        </div>

        <div className="flex flex-col bg-bg-card border border-border-color rounded-2xl shadow-sm overflow-hidden mb-8">
          {paymentMethods.map((method, i) => {
            const isActive = activeMethod === method.id;
            const isLast = i === paymentMethods.length - 1;
            return (
              <div 
                key={method.id}
                onClick={() => setActiveMethod(method.id)}
                className={`flex items-center gap-4 p-4 transition-all cursor-pointer ${
                  isActive ? 'bg-[rgba(0,231,210,0.05)] dark:bg-[rgba(0,231,210,0.05)]' : ''
                } ${!isLast ? 'border-b border-border-color' : ''}`}
              >
                <div className={`w-8 flex items-center justify-center ${isActive && (method.id === 'card' || method.id === 'cash') ? 'text-accent-primary' : ''}`}>
                  {method.icon}
                </div>
                <span className={`flex-1 text-sm font-medium ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {method.name}
                </span>
                <div className="w-5 h-5 flex items-center justify-center">
                  {isActive && <CheckCircle2 className="w-5 h-5 text-accent-primary" />}
                </div>
              </div>
            );
          })}
        </div>

        {activeMethod === 'card' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary">Card Number</label>
              <input 
                type="text" 
                placeholder="4000 1234 5678 9010" 
                className="w-full bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs text-text-secondary">Expiry</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="w-full min-w-0 bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs text-text-secondary">CVV</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  className="w-full min-w-0 bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-bg-main border-t border-border-color p-4 pb-12 z-20">
        <button 
          onClick={() => {
            if (onPaymentSuccess) onPaymentSuccess(activeMethod);
            onNavigate('tracking');
          }}
          className="w-full py-4 rounded-xl font-semibold bg-accent-primary text-white shadow-[0_4px_16px_var(--color-accent-glow)] active:scale-[0.98] transition-transform"
        >
          {activeMethod === 'cash' ? 'Confirm Order' : 'Authorize Payment'}
        </button>
      </div>
    </div>
  );
}
