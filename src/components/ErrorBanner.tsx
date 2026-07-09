import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

interface ErrorBannerProps {
  type?: 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  onDismiss?: () => void;
}

export default function ErrorBanner({ type = 'error', title, message, onDismiss }: ErrorBannerProps) {
  const Icon = type === 'warning' ? AlertTriangle : type === 'critical' ? XCircle : AlertCircle;
  
  const bgColors = {
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
    critical: 'bg-red-600/20 border-red-600/30 text-red-600'
  };

  return (
    <div className={`error-banner flex items-start gap-3 p-4 rounded-xl border ${bgColors[type]} animate-in fade-in slide-in-from-top-2`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold mb-1">{title}</h4>
        <p className="text-xs opacity-90 leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="p-1 -m-1 opacity-70 hover:opacity-100 transition-opacity rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
