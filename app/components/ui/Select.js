'use client';

const Select = ({ 
  label, 
  error, 
  children,
  className = '', 
  labelClassName = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-400 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;

