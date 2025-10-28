
import React from 'react';

interface SensorCardProps {
    icon: React.ReactNode;
    title: string;
    value: React.ReactNode; // Changed to allow styled components
    children?: React.ReactNode;
    className?: string; // Added to allow conditional styling
}

const SensorCard: React.FC<SensorCardProps> = ({ icon, title, value, children, className }) => {
    return (
        <div className={`bg-white dark:bg-gray-800/80 rounded-2xl shadow-sm p-3 flex flex-col h-full transition-all duration-300 ease-in-out ${className || ''}`}>
            <div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    {icon}
                    <span className="ml-2 font-medium">{title}</span>
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mt-2 transition-colors duration-300">
                    {value}
                </div>
            </div>
            {children && <div className="mt-2 flex-grow flex flex-col items-center justify-center">{children}</div>}
        </div>
    );
};

export default SensorCard;
