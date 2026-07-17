import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Smartphone, Mail, Home, Briefcase, Building } from 'lucide-react';
import type { ScreenName } from '../App';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  onSignupAddress?: (address: string) => void;
  onSignupCity?: (city: string) => void;
}

const CITIES = [
  'Bengaluru', 'Hyderabad', 'Noida'
];

export default function AuthScreens({ currentScreen, onNavigate, onSignupAddress, onSignupCity }: AuthProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup Step 2 State
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [activeLabel, setActiveLabel] = useState<'Home' | 'Work' | 'Hostel' | 'PG'>('Home');

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sandboxToast, setSandboxToast] = useState('');

  const isPhoneValid = phone.replace(/\D/g, '').length === 10;
  const isEmailValid = email.includes('@');

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (currentScreen === 'login') {
        onNavigate('signup');
      }
      setTimeout(() => setSignupStep(2), 50);
    } catch (error: any) {
      console.error(error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(error.message);
      }
    }
  };

  const handleLogin = async () => {
    if (authMethod === 'email') {
      if (!isEmailValid || !password) return;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onNavigate('home');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      if (!otpSent) {
        if (!isPhoneValid) {
          alert('Please enter a valid 10-digit phone number');
          return;
        }
        setOtpSent(true);
        setSandboxToast(`OTP sent to your registered mobile number. Use code: 123456.`);
        setTimeout(() => setSandboxToast(''), 6000);
      } else {
        if (otp === '123456') {
          onNavigate('home');
        } else {
          alert('Invalid OTP for Sandbox mode. Use 123456.');
        }
      }
    }
  };

  const handleSignup = async () => {
    if (!city || !pincode || !house || !street || !isValidPincode(city, pincode)) return;

    const formattedAddress = `${house}, ${street}${landmark ? `, Near ${landmark}` : ''}, ${city} - ${pincode}`;

    try {
      if (email && password) {
        // Normal Email Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      if (onSignupAddress) {
        onSignupAddress(formattedAddress);
      }
      if (onSignupCity) {
        onSignupCity(city);
      }

      setSandboxToast("Account created successfully!");
      setTimeout(() => {
        setSandboxToast('');
        onNavigate('login');
      }, 3000);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isPasswordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/.test(password);

  const isValidPincode = (city: string, pin: string) => {
    if (pin.length !== 6) return false;
    if (city === 'Bengaluru' && !pin.startsWith('560')) return false;
    if (city === 'Noida' && !pin.startsWith('201')) return false;
    if (city === 'Hyderabad' && !(pin.startsWith('500') || pin.startsWith('501'))) return false;
    return true;
  };
  
  const pinValid = pincode.length === 0 || isValidPincode(city, pincode);

  const isLoginValid = authMethod === 'email' ? (isEmailValid && password) : (isPhoneValid && (!otpSent || otp.length === 6));
  const isSignupStep1Valid = isEmailValid && isPasswordStrong && name && isPhoneValid && termsAccepted;
  const isSignupStep2Valid = city && pincode.length === 6 && house && street && isValidPincode(city, pincode);

  return (
    <div className="flex flex-col h-full w-full bg-bg-main relative">
      {sandboxToast && (
        <div className="absolute top-4 left-4 right-4 bg-emerald-500/90 text-white p-4 rounded-xl text-sm font-semibold shadow-lg z-50 animate-in slide-in-from-top-4">
          {sandboxToast}
        </div>
      )}
      
      <header className="p-6 pt-12 flex justify-between items-center bg-bg-main">
        <button onClick={() => {
          if (currentScreen === 'signup' && signupStep === 2) {
            setSignupStep(1);
          } else {
            onNavigate('onboarding');
          }
        }} className="text-text-primary p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary flex flex-col items-center">
          {currentScreen === 'login' ? 'Log In' : 'Sign Up'}
          {currentScreen === 'signup' && (
            <span className="text-[10px] text-text-secondary mt-1">Steps: {signupStep}/2</span>
          )}
        </h3>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        {currentScreen === 'login' && (
          <div className="flex flex-col gap-4 py-6">
            <div className="flex bg-bg-elevated p-1 rounded-xl mb-4">
              <button 
                onClick={() => { setAuthMethod('phone'); setOtpSent(false); setOtp(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${authMethod === 'phone' ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-secondary'}`}
              >
                <Smartphone className="w-4 h-4" /> Phone
              </button>
              <button 
                onClick={() => setAuthMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${authMethod === 'email' ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-secondary'}`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>

            {authMethod === 'email' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-secondary">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-secondary">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-bg-elevated border border-border-color rounded-xl p-4 pr-12 text-sm text-text-primary outline-none focus:border-accent-primary"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-secondary">Phone Number</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex">
                      <div className="bg-bg-elevated border border-border-color border-r-0 rounded-l-xl p-4 text-sm text-text-secondary flex items-center justify-center">
                        +91
                      </div>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210" 
                        disabled={otpSent}
                        className="flex-1 bg-bg-elevated border border-border-color rounded-r-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
                {otpSent && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 mt-2">
                    <label className="text-xs text-text-secondary">Enter 6-digit OTP</label>
                    <div className="flex justify-between gap-2">
                      {[...Array(6)].map((_, i) => (
                        <input 
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          maxLength={1}
                          value={otp[i] || ''}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val) {
                              const newOtp = otp.split('');
                              newOtp[i] = val;
                              setOtp(newOtp.join(''));
                              if (i < 5) document.getElementById(`otp-${i+1}`)?.focus();
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Backspace') {
                              if (!otp[i] && i > 0) {
                                document.getElementById(`otp-${i-1}`)?.focus();
                              } else {
                                const newOtp = otp.split('');
                                newOtp[i] = '';
                                setOtp(newOtp.join(''));
                              }
                            }
                          }}
                          className="w-11 h-12 sm:w-12 sm:h-14 text-center bg-bg-elevated border border-border-color rounded-xl text-lg text-text-primary outline-none focus:border-accent-primary font-bold transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            <button 
              onClick={handleLogin}
              disabled={!isLoginValid}
              className="mt-4 w-full py-4 rounded-xl font-semibold bg-accent-primary text-white disabled:bg-border-color disabled:text-text-secondary disabled:shadow-none transition-all shadow-[0_4px_16px_var(--color-accent-glow)]"
            >
              {authMethod === 'email' ? 'Log In' : (otpSent ? 'Verify & Login' : 'Send OTP')}
            </button>

            <div className="relative flex items-center gap-4 my-2">
              <div className="flex-1 border-t border-border-color"></div>
              <span className="text-xs text-text-secondary font-medium uppercase">Or</span>
              <div className="flex-1 border-t border-border-color"></div>
            </div>
            
            <button 
              onClick={handleGoogleSignIn}
              className="w-full py-4 rounded-xl font-semibold bg-bg-elevated border border-border-color text-text-primary flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-text-secondary mt-2">
              Don't have an account? <span onClick={() => onNavigate('signup')} className="text-accent-primary font-semibold cursor-pointer">Sign Up</span>
            </p>
          </div>
        )}

        {currentScreen === 'signup' && signupStep === 1 && (
          <div className="flex flex-col gap-4 py-6 animate-in fade-in slide-in-from-left-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Aditya" 
                className="bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary">Phone Number</label>
              <div className="flex">
                <div className="bg-bg-elevated border border-border-color border-r-0 rounded-l-xl p-4 text-sm text-text-secondary flex items-center justify-center">
                  +91
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210" 
                  className="flex-1 bg-bg-elevated border border-border-color rounded-r-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="aditya@example.com" 
                className="bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-bg-elevated border border-border-color rounded-xl p-4 pr-12 text-sm text-text-primary outline-none focus:border-accent-primary"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password.length > 0 && !isPasswordStrong && (
                <span className="text-[10px] text-red-500 mt-1">Must be 9+ chars, with uppercase, lowercase, digit & special char.</span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <input 
                type="checkbox" 
                id="tnc"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 rounded-md border-border-color text-action-primary focus:ring-action-primary bg-bg-elevated accent-action-primary"
              />
              <label htmlFor="tnc" className="text-xs text-text-secondary leading-tight cursor-pointer">
                I agree to the <span className="text-accent-primary">Terms and Conditions</span> and Privacy Policy.
              </label>
            </div>

            <button 
              onClick={() => setSignupStep(2)}
              disabled={!isSignupStep1Valid}
              className="mt-4 w-full py-4 rounded-xl font-semibold bg-accent-primary text-white disabled:bg-border-color disabled:text-text-secondary transition-all shadow-[0_4px_16px_var(--color-accent-glow)] disabled:shadow-none flex items-center justify-center gap-2"
            >
              Enter Address ➔
            </button>

            <div className="relative flex items-center gap-4 my-2">
              <div className="flex-1 border-t border-border-color"></div>
              <span className="text-xs text-text-secondary font-medium uppercase">Or</span>
              <div className="flex-1 border-t border-border-color"></div>
            </div>
            
            <button 
              onClick={handleGoogleSignIn}
              className="w-full py-4 rounded-xl font-semibold bg-bg-elevated border border-border-color text-text-primary flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-text-secondary mt-2">
              Already have an account? <span onClick={() => onNavigate('login')} className="text-accent-primary font-semibold cursor-pointer">Log In</span>
            </p>
          </div>
        )}

        {currentScreen === 'signup' && signupStep === 2 && (
          <div className="flex flex-col gap-4 py-6 animate-in fade-in slide-in-from-right-4">
            <h4 className="text-sm font-semibold text-text-primary mb-2">Set Pickup Location</h4>
            
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

            <button 
              onClick={handleSignup}
              disabled={!isSignupStep2Valid}
              className="w-full py-4 rounded-xl font-semibold bg-accent-primary text-white disabled:bg-border-color disabled:text-text-secondary transition-all shadow-[0_4px_16px_var(--color-accent-glow)] disabled:shadow-none"
            >
              Create Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
