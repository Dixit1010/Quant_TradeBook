/*
================================================================================
| FILE: app/components/ui/Button.js (Corrected)                                |
================================================================================
*/
'use client';

export const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false }) => {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    // By adding suppressHydrationWarning, we tell React to ignore attributes
    // added by browser extensions on this element.
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      suppressHydrationWarning={true} 
    >
      {children}
    </button>
  );
};
