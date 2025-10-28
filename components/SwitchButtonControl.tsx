import React from 'react';

interface SwitchButtonControlProps {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  icon: React.ReactElement<{ className?: string }>;
  onColorClasses?: string;
}

const SwitchButtonControl: React.FC<SwitchButtonControlProps> = ({ label, isOn, onToggle, icon, onColorClasses }) => {
  const baseClasses = "w-full h-28 rounded-2xl flex flex-col items-center justify-center p-2 font-semibold transition-all duration-300 ease-in-out transform active:scale-95 shadow-md";
  const defaultOnClasses = "bg-blue-600 text-white shadow-lg shadow-blue-500/50";
  const onClasses = onColorClasses || defaultOnClasses;
  const offClasses = "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600";

  return (
    <button
      onClick={onToggle}
      className={`${baseClasses} ${isOn ? onClasses : offClasses}`}
    >
      {React.cloneElement(icon, { className: 'w-8 h-8 mb-2' })}
      <span className="text-center text-base leading-tight">{label}</span>
    </button>
  );
};

export default SwitchButtonControl;