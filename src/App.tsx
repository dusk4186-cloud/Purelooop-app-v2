import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import DeviceFrame from './components/DeviceFrame';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import AuthScreens from './components/AuthScreens';
import HomeScreen from './components/HomeScreen';
import ProviderProfile from './components/ProviderProfile';
import BookingScreen from './components/BookingScreen';
import PaymentScreen from './components/PaymentScreen';
import TrackingScreen from './components/TrackingScreen';
import ProfileScreen from './components/ProfileScreen';
import EditProfileScreen from './components/EditProfileScreen';
import AddressesScreen from './components/AddressesScreen';
import NotificationScreen from './components/NotificationScreen';
import { ArrowLeft } from 'lucide-react';

interface SettingsProps {
  title: string;
  onNavigate: (screen: ScreenName) => void;
}

function GenericSettingsScreen({ title, onNavigate }: SettingsProps) {
  return (
    <div className="flex flex-col h-full w-full bg-bg-main">
      <header className="p-6 pt-12 flex items-center bg-bg-main">
        <button onClick={() => onNavigate('profile')} className="text-text-primary p-2 -ml-2 mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </header>
      
      <div className="flex-1 px-6 pt-10 flex flex-col items-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">Coming Soon</h2>
        <p className="text-text-secondary text-center max-w-[250px]">
          The {title.toLowerCase()} page is currently under construction.
        </p>
      </div>
    </div>
  );
}

export type ScreenName = 
  | 'splash' 
  | 'onboarding' 
  | 'login' 
  | 'signup' 
  | 'check-email' 
  | 'home' 
  | 'profile' 
  | 'provider' 
  | 'booking' 
  | 'payment' 
  | 'tracking'
  | 'addresses'
  | 'payments'
  | 'settings'
  | 'help'
  | 'privacy'
  | 'edit-profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [session, setSession] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [activeOrderDetails, setActiveOrderDetails] = useState<{date: string, time: string} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [userAddress, setUserAddress] = useState<string>('B-402, Royal Residency, MG Road, Bangalore, 560001');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user);
      
      if (user) {
        if (currentScreen === 'splash') {
          setTimeout(() => setCurrentScreen('home'), 1500);
        } else if (['login', 'signup', 'check-email'].includes(currentScreen)) {
          setCurrentScreen('home');
        }
      } else {
        if (currentScreen === 'splash') {
          setTimeout(() => setCurrentScreen('onboarding'), 1500);
        }
      }
    });

    return () => unsubscribe();
  }, [currentScreen]);

  // Screen variants for framer-motion transitions
  const screenVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  const screenTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen onNavigate={setCurrentScreen} />;
      case 'login':
      case 'signup':
      case 'check-email':
        return <AuthScreens currentScreen={currentScreen} onNavigate={setCurrentScreen} onSignupAddress={setUserAddress} />;
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} onSelectProvider={setSelectedProvider} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      case 'provider':
        return <ProviderProfile providerId={selectedProvider} onNavigate={setCurrentScreen} />;
      case 'booking':
        return <BookingScreen providerId={selectedProvider} onNavigate={setCurrentScreen} onBookingComplete={setActiveOrderDetails} userAddress={userAddress} />;
      case 'payment':
        return <PaymentScreen onNavigate={setCurrentScreen} onPaymentSuccess={(method) => { setHasActiveOrder(true); setPaymentMethod(method); }} />;
      case 'tracking':
        return <TrackingScreen onNavigate={setCurrentScreen} hasActiveOrder={hasActiveOrder} activeOrderDetails={activeOrderDetails} paymentMethod={paymentMethod} />;
      case 'edit-profile':
        return <EditProfileScreen onNavigate={setCurrentScreen} />;
      case 'addresses':
        return <AddressesScreen onNavigate={setCurrentScreen} userAddress={userAddress} setUserAddress={setUserAddress} />;
      case 'payments':
        return <GenericSettingsScreen title="Payment Methods" onNavigate={setCurrentScreen} />;
      case 'settings':
        return <NotificationScreen onNavigate={setCurrentScreen} />;
      case 'help':
        return <GenericSettingsScreen title="Help & Support" onNavigate={setCurrentScreen} />;
      case 'privacy':
        return <GenericSettingsScreen title="Legal / Privacy" onNavigate={setCurrentScreen} />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center font-sans">
      <DeviceFrame>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial="initial"
            animate="in"
            exit="out"
            variants={screenVariants}
            transition={screenTransition}
            className="w-full h-full absolute top-0 left-0"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </DeviceFrame>
    </div>
  );
}
