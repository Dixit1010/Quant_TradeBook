export const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-700 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);