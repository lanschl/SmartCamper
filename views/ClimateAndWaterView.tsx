import React, { useState, useEffect } from 'react';
import { VanState, SwitchDevice, DimmableDevice, DieselHeaterState, DieselHeaterMode, DieselHeaterStatus } from '../types';
import FatSliderControl from '../components/FatSliderControl';
import SwitchButtonControl from '../components/SwitchButtonControl';
import { PowerIcon, HeaterIcon, TemperatureIcon, FlameIcon, FanIcon, BatteryIcon, WarningIcon } from '../components/Icons';

const statusTextMap: { [key in DieselHeaterStatus]: string } = {
  off: 'Heater Off',
  starting: 'Starting...',
  warming_up: 'Warming Up',
  running: 'Running',
  shutting_down: 'Shutting Down',
};

const DataPoint: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center text-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
        <div className="text-orange-500">{icon}</div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
);

const ModeButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; disabled?: boolean; }> = ({ label, isActive, onClick, disabled }) => {
    const baseClasses = "w-full text-center font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-in-out";
    const activeClasses = "bg-orange-500 text-white shadow-md";
    const inactiveClasses = "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600";
    const disabledClasses = "opacity-50 cursor-not-allowed";

    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`}>
            {label}
        </button>
    );
};


interface HeatingViewProps {
  boiler: SwitchDevice;
  floorHeating: DimmableDevice;
  dieselHeater: DieselHeaterState;
  onUpdate: (updateFn: (prevState: VanState) => VanState) => void;
}

const HeatingView: React.FC<HeatingViewProps> = ({ boiler, floorHeating, dieselHeater, onUpdate }) => {
  
  const handleBoilerToggle = (isOn: boolean) => {
    onUpdate(prevState => ({ ...prevState, boiler: { ...prevState.boiler, isOn } }));
  };

  const handleFloorHeatingChange = (level: number) => {
    onUpdate(prevState => ({ ...prevState, floorHeating: { ...prevState.floorHeating, level } }));
  };
  
  const handleDieselHeaterUpdate = (newHeaterState: Partial<DieselHeaterState>) => {
      onUpdate(prevState => ({
          ...prevState,
          dieselHeater: { ...prevState.dieselHeater, ...newHeaterState }
      }));
  };
  
  const handlePowerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shouldBeOn = e.target.checked;
    if (shouldBeOn && dieselHeater.status === 'off') {
        handleDieselHeaterUpdate({ status: 'starting' });
    } else if (!shouldBeOn && dieselHeater.status !== 'off' && dieselHeater.status !== 'shutting_down') {
        handleDieselHeaterUpdate({ status: 'shutting_down' });
    }
  };

  const isHeaterOn = dieselHeater.status !== 'off';
  const isTransitioning = dieselHeater.status === 'starting' || dieselHeater.status === 'shutting_down';

  const renderDieselHeaterControl = () => {
      switch (dieselHeater.mode) {
          case 'temperature':
              return (
                  <FatSliderControl
                      label="Set Temperature"
                      level={dieselHeater.setpoint}
                      onChange={level => handleDieselHeaterUpdate({ setpoint: level })}
                      color="#F97316"
                      min={18}
                      max={30}
                      unit="°C"
                  />
              );
          case 'power':
              return (
                  <FatSliderControl
                      label="Set Power Level"
                      level={dieselHeater.powerLevel}
                      onChange={level => handleDieselHeaterUpdate({ powerLevel: level })}
                      color="#F97316"
                      min={0}
                      max={9}
                      unit=""
                  />
              );
          case 'ventilation':
              return (
                  <FatSliderControl
                      label="Set Ventilation Speed"
                      level={dieselHeater.ventilationLevel}
                      onChange={level => handleDieselHeaterUpdate({ ventilationLevel: level })}
                      color="#3B82F6" // Blue for ventilation
                  />
              );
          default:
              return null;
      }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Heating</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Systems Card */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 flex flex-col justify-center gap-8">
            <SwitchButtonControl
                label={boiler.name}
                isOn={boiler.isOn}
                onToggle={() => handleBoilerToggle(!boiler.isOn)}
                icon={<HeaterIcon />}
                onColorClasses="bg-orange-500 text-white shadow-lg shadow-orange-500/50"
            />
            <FatSliderControl
                label={floorHeating.name}
                level={floorHeating.level}
                onChange={handleFloorHeatingChange}
                color="#F97316" // Orange-500 for heat
            />
        </div>

        {/* Diesel Heater Card */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Diesel Heater</h3>
                    <p className="text-orange-500 font-semibold">{statusTextMap[dieselHeater.status]}</p>
                </div>
                <label htmlFor="diesel-heater-power" className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="diesel-heater-power"
                        className="sr-only peer" 
                        checked={isHeaterOn}
                        disabled={isTransitioning}
                        onChange={handlePowerToggle}
                    />
                    <div className="w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 after:ease-in-out dark:border-gray-600 peer-checked:bg-orange-500 peer-checked:shadow-lg peer-checked:shadow-orange-500/40 dark:peer-checked:shadow-orange-800/40 transition-all duration-300 ease-in-out peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
            </div>
            
            {dieselHeater.errors && (
                <div className="flex items-center p-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    <WarningIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                    <span className="font-semibold">Heater Error Code: {dieselHeater.errors}</span>
                </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
                <DataPoint icon={<TemperatureIcon className="w-6 h-6"/>} label="Heater" value={`${dieselHeater.readings.heaterTemp}°C`} />
                <DataPoint icon={<FlameIcon className="w-6 h-6"/>} label="Flame" value={`${dieselHeater.readings.flameTemp}°C`} />
                <DataPoint icon={<TemperatureIcon className="w-6 h-6"/>} label="Panel" value={`${dieselHeater.readings.panelTemp}°C`} />
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-3 gap-3">
                    <ModeButton label="Temp" isActive={dieselHeater.mode === 'temperature'} onClick={() => handleDieselHeaterUpdate({ mode: 'temperature' })} disabled={!isHeaterOn} />
                    <ModeButton label="Power" isActive={dieselHeater.mode === 'power'} onClick={() => handleDieselHeaterUpdate({ mode: 'power' })} disabled={!isHeaterOn} />
                    <ModeButton label="Vent" isActive={dieselHeater.mode === 'ventilation'} onClick={() => handleDieselHeaterUpdate({ mode: 'ventilation' })} disabled={!isHeaterOn} />
                </div>
                <div className={`transition-opacity duration-300 ${isHeaterOn ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    {renderDieselHeaterControl()}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default HeatingView;