'use client';

import { useEffect } from 'react';
import { CloseIcon } from '../../icons';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}) => {
  // Modal açıkken body scroll'unu engelle
  useEffect(() => {
    if (isOpen) {
      // Mevcut scroll pozisyonunu sakla
      const scrollY = window.scrollY;
      
      // Body'ye overflow hidden ekle
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Modal kapandığında eski haline döndür
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Scroll pozisyonunu geri yükle
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-3xl',
    '3xl': 'max-w-5xl',
  };

  const handleBackdropClick = (e) => {
    // Sadece backdrop'a tıklandığında kapat, içeriğe değil
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-99999 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full ${sizeClasses[size]} ${className} max-h-[90vh] flex flex-col z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900 flex flex-col max-h-full overflow-hidden">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 md:px-5 md:py-3.5 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="!p-1.5"
              >
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Content - Bu kısım scroll edilebilir */}
          <div className="p-4 md:p-5 overflow-y-auto flex-1 overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
