import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-600" size={20} />,
    error: <AlertCircle className="text-red-600" size={20} />,
    warning: <AlertTriangle className="text-yellow-600" size={20} />,
    info: <Info className="text-blue-600" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border-2 shadow-lg ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-gray-800">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
