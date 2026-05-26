'use client';

const Badge = ({ children, color = 'success', className = '' }) => {
  const colorClasses = {
    success: 'bg-success-50 text-success-600 border-success-200',
    error: 'bg-error-50 text-error-600 border-error-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
    accent: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-500/10 dark:text-accent-400 dark:border-accent-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
