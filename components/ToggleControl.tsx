
import React from 'react';

interface ToggleControlProps {
  // FIX: Changed icon type to be a ReactElement that accepts a className prop.
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  isOn: boolean;
  onToggle: (isOn: boolean) => void;
}

const ToggleControl: React.FC<ToggleControlProps> = ({ icon, label, isOn, onToggle }) => {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center">
        <div className="text-gray-500 dark:text-gray-400">
            {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <span className="ml-4 text-base font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <label htmlFor={label} className="relative inline-flex items-center cursor-pointer">
        <input 
            type="checkbox" 
            id={label} 
            className="sr-only peer" 
            checked={isOn}
            onChange={(e) => onToggle(e.target.checked)}
        />
        <div className="w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 after:ease-in-out dark:border-gray-600 peer-checked:bg-blue-600 peer-checked:shadow-lg peer-checked:shadow-blue-500/40 dark:peer-checked:shadow-blue-800/40 transition-all duration-300 ease-in-out"></div>
      </label>
    </div>
  );
};

export default ToggleControl;
