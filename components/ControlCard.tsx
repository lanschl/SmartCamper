
import React from 'react';

interface ControlCardProps {
  title: string;
  children: React.ReactNode;
}

const ControlCard: React.FC<ControlCardProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-sm p-3 mb-3">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default ControlCard;
