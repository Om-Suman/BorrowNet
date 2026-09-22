import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function AlertBanner({ type = 'info', message, onDismiss, children, className = '' }) {
  const config = {
    info: { icon: Info, bg: 'bg-trust/10', border: 'border-trust', text: 'text-trust' },
    success: { icon: CheckCircle, bg: 'bg-success/10', border: 'border-success', text: 'text-success' },
    warning: { icon: AlertTriangle, bg: 'bg-warning/10', border: 'border-warning', text: 'text-warning' },
    error: { icon: AlertCircle, bg: 'bg-danger/10', border: 'border-danger', text: 'text-danger' },
  };

  const { icon: Icon, bg, border, text } = config[type];

  return (
    <div className={`flex items-start p-4 border-l-4 rounded-r-md ${bg} ${border} ${className}`}>
      <Icon className={`w-5 h-5 ${text} mt-0.5 shrink-0`} />
      <div className="ml-3 flex-1">
        {message && <p className={`text-sm font-medium ${text}`}>{message}</p>}
        {children && <div className="text-sm mt-1 text-textPrimary">{children}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className={`ml-auto pl-3 ${text} hover:opacity-80 transition-opacity`}>
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
