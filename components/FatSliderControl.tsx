
import React, { useState, useEffect } from 'react';

// A simple hook to detect dark mode and update on change.
const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setIsDarkMode(mediaQuery.matches);

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return isDarkMode;
}


interface FatSliderControlProps {
  label: string;
  level: number;
  onChange: (level: number) => void;
  color: string;
  min?: number;
  max?: number;
  unit?: string;
}

const FatSliderControl: React.FC<FatSliderControlProps> = ({ label, level, onChange, color, min = 0, max = 100, unit = '%' }) => {
  const isDarkMode = useDarkMode();
  
  // Choose track color based on dark mode state.
  const trackColor = isDarkMode ? '#374151' : '#e5e7eb'; // Corresponds to dark:bg-gray-700 and bg-gray-200

  const levelPercent = ((level - min) / (max - min)) * 100;
  const sliderBackground = `linear-gradient(to right, ${color} ${levelPercent}%, ${trackColor} ${levelPercent}%)`;

  return (
    <div className="w-full">
      <label className="text-base font-semibold text-gray-800 dark:text-gray-200">{label}</label>
      <div className="flex items-center space-x-4 mt-2">
        <input
            type="range"
            min={min}
            max={max}
            value={level}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="custom-slider flex-grow rounded-lg"
            style={{ 
              background: sliderBackground,
            }}
        />
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 w-16 text-right">{level}{unit}</span>
      </div>
    </div>
  );
};

export default FatSliderControl;