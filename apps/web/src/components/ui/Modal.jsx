import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className={`bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm p-0 m-auto ${sizes[size]} w-full`}
    >
      <div className="bg-surface border border-borderSubtle rounded-lg shadow-xl overflow-hidden w-full text-textPrimary">
        {title && (
          <div className="px-6 py-4 border-b border-borderSubtle flex justify-between items-center">
            <h3 className="text-lg font-display font-medium">{title}</h3>
            <button onClick={handleClose} className="text-textSecondary hover:text-textPrimary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </dialog>
  );
}
