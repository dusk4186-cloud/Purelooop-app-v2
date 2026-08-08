import { useState } from 'react';
import { ArrowLeft, Bell, MessageSquare, Tag } from 'lucide-react';
import type { ScreenName } from '../App';

interface NotificationScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

export default function NotificationScreen({ onNavigate }: NotificationScreenProps) {
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: false,
    smsAlerts: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
        <h3 className="text-xl font-bold text-text-primary flex-1">Notifications</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        <p className="text-sm text-text-secondary mb-8">
          Choose what you want to be notified about. Order updates are highly recommended.
        </p>

        <div className="flex flex-col gap-6">
          {/* Toggle Item: Order Updates */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-action-primary/10 text-action-primary rounded-xl shrink-0 mt-1">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary mb-1">Order Updates</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Get notified when your laundry is picked up, washed, and out for delivery.
                </p>
              </div>
            </div>
            
            <button 
              role="switch"
              aria-checked={preferences.orderUpdates}
              aria-label="Toggle Order Updates"
              onClick={() => togglePreference('orderUpdates')}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${
                preferences.orderUpdates ? 'bg-action-primary' : 'bg-border-color'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  preferences.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="h-[1px] w-full bg-border-color/50"></div>

          {/* Toggle Item: Promotional Offers */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-action-primary/10 text-action-primary rounded-xl shrink-0 mt-1">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary mb-1">Promotions & Offers</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Receive discount codes, seasonal offers, and promotional content.
                </p>
              </div>
            </div>
            
            <button 
              role="switch"
              aria-checked={preferences.promotions}
              aria-label="Toggle Promotions"
              onClick={() => togglePreference('promotions')}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${
                preferences.promotions ? 'bg-action-primary' : 'bg-border-color'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  preferences.promotions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="h-[1px] w-full bg-border-color/50"></div>

          {/* Toggle Item: SMS Alerts */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-action-primary/10 text-action-primary rounded-xl shrink-0 mt-1">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary mb-1">SMS Alerts</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Get text messages for immediate tracking links when the delivery partner arrives.
                </p>
              </div>
            </div>
            
            <button 
              role="switch"
              aria-checked={preferences.smsAlerts}
              aria-label="Toggle SMS Alerts"
              onClick={() => togglePreference('smsAlerts')}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${
                preferences.smsAlerts ? 'bg-action-primary' : 'bg-border-color'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  preferences.smsAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
