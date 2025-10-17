'use client';

const Table = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div className="overflow-x-auto">
      <table 
        className={`w-full text-left text-sm text-gray-600 dark:text-gray-400 ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr className="border-b border-gray-200 dark:border-gray-700">
        {children}
      </tr>
    </thead>
  );
};

const TableHeaderCell = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3 font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </th>
  );
};

const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', onClick }) => {
  return (
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 text-gray-800 dark:text-white/90 ${className}`}>
      {children}
    </td>
  );
};

export {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
};

