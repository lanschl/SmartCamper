
import React from 'react';
import { View } from '../types';
import { DashboardIcon, LightbulbIcon, HeaterIcon } from './Icons';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
    label: string;
    view: View;
    activeView: View;
    onClick: (view: View) => void;
    children: React.ReactNode;
}> = ({ label, view, activeView, onClick, children }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'}`}
    >
      {children}
      <span className={`text-xs font-medium mt-1 ${isActive ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900-blur backdrop-blur-lg border-t border-gray-200 dark:border-gray-700/50 shadow-t-lg">
      <nav className="grid grid-cols-3 items-center h-full max-w-lg mx-auto">
        <NavButton label="Dashboard" view="dashboard" activeView={activeView} onClick={setActiveView}>
            <DashboardIcon className="w-6 h-6" />
        </NavButton>
        <NavButton label="Controls" view="controls" activeView={activeView} onClick={setActiveView}>
            <LightbulbIcon className="w-6 h-6" />
        </NavButton>
        <NavButton label="Heating" view="heating" activeView={activeView} onClick={setActiveView}>
            <HeaterIcon className="w-6 h-6" />
        </NavButton>
      </nav>
    </footer>
  );
};

export default BottomNav;