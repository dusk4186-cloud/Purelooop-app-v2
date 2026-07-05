import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Banknote, CheckCircle2 } from 'lucide-react';
import type { ScreenName } from '../App';

interface PaymentScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onPaymentSuccess?: (method: string) => void;
}

export default function PaymentScreen({ onNavigate, onPaymentSuccess }: PaymentScreenProps) {
  const [activeMethod, setActiveMethod] = useState('card');

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
        <div className="text-center py-8 pb-10">
          <p className="text-sm text-text-secondary mb-1">Total to Pay</p>
          <h2 className="text-4xl font-extrabold text-accent-primary">₹320.00</h2>
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
          {activeMethod === 'cash' ? 'Confirm Order' : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
}
