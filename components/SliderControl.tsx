import React from 'react';

interface SliderControlProps {
  // FIX: Changed icon type to be a ReactElement that accepts a className prop.
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  level: number;
  onChange: (level: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ icon, label, level, onChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="text-gray-500 dark:text-gray-400">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div className="flex-grow">
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="flex items-center mt-1">
          <input
            type="range"
            min="0"
            max="100"
            value={level}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${level}%, #E5E7EB ${level}%, #E5E7EB 100%)`
            }}
          />
          <span className="ml-4 text-base font-semibold text-gray-800 dark:text-gray-200 w-10 text-right">{level}%</span>
        </div>
      </div>
    </div>
  );
};

export default SliderControl;