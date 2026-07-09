import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Smartphone, Mail } from 'lucide-react';
import type { ScreenName } from '../App';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  onSignupAddress?: (address: string) => void;
}

export default function AuthScreens({ currentScreen, onNavigate, onSignupAddress }: AuthProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sandboxToast, setSandboxToast] = useState('');

  const isPhoneValid = phone.replace(/\D/g, '').length === 10;
  const isEmailValid = email.includes('@');

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onNavigate('home');
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
    if (!isEmailValid || !password || !name || !isPhoneValid || !address) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      if (onSignupAddress) {
        onSignupAddress(address);
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
  
  const isLoginValid = authMethod === 'email' ? (isEmailValid && password) : (isPhoneValid && (!otpSent || otp.length === 6));
  const isSignupValid = isEmailValid && isPasswordStrong && name && isPhoneValid && address.length > 5;

  return (
    <div className="flex flex-col h-full w-full bg-bg-main relative">
      {sandboxToast && (
        <div className="absolute top-4 left-4 right-4 bg-emerald-500/90 text-white p-4 rounded-xl text-sm font-semibold shadow-lg z-50 animate-in slide-in-from-top-4">
          {sandboxToast}
        </div>
      )}
      
      <header className="p-6 pt-12 flex justify-between items-center bg-bg-main">
        <button onClick={() => onNavigate('onboarding')} className="text-text-primary p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">
          {currentScreen === 'login' ? 'Log In' : 'Sign Up'}
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
                    <label className="text-xs text-text-secondary">Enter OTP</label>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456" 
                      className="w-full bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary tracking-widest font-semibold"
                    />
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

        {currentScreen === 'signup' && (
          <div className="flex flex-col gap-4 py-6">
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
              <label className="text-xs text-text-secondary">Pickup Address</label>
              <textarea 
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House No, Street, Landmark, City" 
                className="bg-bg-elevated border border-border-color rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-primary min-h-[80px] resize-none"
              />
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
            
            <button 
              onClick={handleSignup}
              disabled={!isSignupValid}
              className="mt-4 w-full py-4 rounded-xl font-semibold bg-accent-primary text-white disabled:bg-border-color disabled:text-text-secondary transition-all shadow-[0_4px_16px_var(--color-accent-glow)] disabled:shadow-none"
            >
              Create Account
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
      </div>
    </div>
  );
}
