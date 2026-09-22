import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ id, type = 'info', message, onDismiss, duration = 4000 }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsClosing(true);
      }, duration - 300);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(onDismiss, 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-trust" />,
  };

  const borders = {
    success: 'border-success',
    error: 'border-danger',
    warning: 'border-warning',
    info: 'border-trust',
  };

  return (
    <div 
      className={`flex items-center p-4 bg-surfaceElevated border border-borderSubtle border-l-4 ${borders[type]} rounded shadow-lg min-w-[300px] max-w-md transition-all duration-300 ease-in-out transform ${isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
    >
      <div className="shrink-0 mr-3">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm text-textPrimary">{message}</p>
      <button onClick={handleDismiss} className="ml-4 text-textSecondary hover:text-textPrimary shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
