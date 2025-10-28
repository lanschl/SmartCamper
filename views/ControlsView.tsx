import React from 'react';
import { VanState, DimmableDevice, SwitchDevice } from '../types';
import FatSliderControl from '../components/FatSliderControl';
import SwitchButtonControl from '../components/SwitchButtonControl';
import { WaterDropIcon, VentIcon, HeaterIcon, LockIcon, UnlockIcon, PowerIcon } from '../components/Icons';

interface ControlsViewProps {
  lights: DimmableDevice[];
  switches: SwitchDevice[];
  onUpdate: (updateFn: (prevState: VanState) => VanState) => void;
}

const ControlsView: React.FC<ControlsViewProps> = ({ lights, switches, onUpdate }) => {

  const handleLightChange = (id: string, level: number) => {
    onUpdate(prevState => ({
      ...prevState,
      lights: prevState.lights.map(l => l.id === id ? { ...l, level } : l)
    }));
  };
  
  const handleSwitchToggle = (id:string, isOn: boolean) => {
    onUpdate(prevState => ({
      ...prevState,
      switches: prevState.switches.map(s => s.id === id ? { ...s, isOn } : s)
    }));
  };

  const getIconForSwitch = (id: string, isOn: boolean) => {
    // Per user request, all drains use a down-facing arrow icon.
    if (id.includes('drain')) {
      return <WaterDropIcon />;
    }
    if (id.includes('drawer')) return isOn ? <UnlockIcon /> : <LockIcon />;
    if (id.includes('hot')) return <HeaterIcon />;
    if (id.includes('pump')) return <PowerIcon />;
    // Fallback icon
    return <PowerIcon />;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Controls</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Lights */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800/80 rounded-2xl p-4 flex flex-col justify-between">
          {lights.map(light => (
            <FatSliderControl
              key={light.id}
              label={light.name}
              level={light.level}
              onChange={(level) => handleLightChange(light.id, level)}
              color="#3B82F6" // Changed to blue-500 for a consistent theme
            />
          ))}
        </div>

        {/* Right Column: Switches */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {switches.map(s => (
            <SwitchButtonControl
              key={s.id}
              label={s.name}
              isOn={s.isOn}
              onToggle={() => handleSwitchToggle(s.id, !s.isOn)}
              icon={getIconForSwitch(s.id, s.isOn)}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default ControlsView;