'use client';

const Badge = ({ children, color = 'success', className = '' }) => {
  const colorClasses = {
    success: 'bg-success-50 text-success-600 border-success-200',
    error: 'bg-error-50 text-error-600 border-error-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    brand: 'bg-brand-50 text-brand-600 border-brand-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
