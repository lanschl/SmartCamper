import React, { useState, useEffect } from 'react';
import { VanState, View } from './types';
import BottomNav from './components/BottomNav';
import DashboardView from './views/DashboardView';
import ControlsView from './views/ControlsView';
import ClimateAndWaterView from './views/ClimateAndWaterView';

const generateBoilerHistory = () => {
  const history: { time: number; temp: number }[] = [];
  const now = Date.now();
  for (let i = 12; i >= 0; i--) {
    const time = now - i * 60 * 60 * 1000;
    const baseTemp = 40;
    const tempFluctuation = Math.random() * 5;
    const temp = baseTemp + Math.sin((12 - i) / 12 * Math.PI) * 25 + tempFluctuation;
    history.push({ time, temp: Math.round(temp) });
  }
  return history;
};

const initialVanState: VanState = {
  sensors: {
    freshWater: 82,
    grayWater: 34,
    boilerTemp: 80,
    insideTemp: 5,
    outsideTemp: -10,
    batterySoC: 95,
    batteryVoltage: 13.2,
    batteryAmperage: 2.5,
    boilerTempHistory: generateBoilerHistory(),
  },
  lights: [
    { id: 'deko', name: 'Deko Lights', level: 75 },
    { id: 'ambiente', name: 'Ambiente Lights', level: 50 },
    { id: 'ceiling', name: 'Ceiling Lights', level: 20 },
  ],
  switches: [
    { id: 'gray_drain', name: 'Gray Water Drain', isOn: false },
    { id: 'fresh_winter_drain', name: 'Fresh Winter Drain', isOn: false },
    { id: 'shower_drain', name: 'Shower Drain Pump', isOn: false },
    { id: 'fresh_pump', name: 'Fresh Water Pump', isOn: true },
    { id: 'hot_pump', name: 'Hot Water Pump', isOn: false },
    { id: 'drawers', name: 'Drawer Locks', isOn: true },
  ],
  boiler: { id: 'boiler_heat', name: 'Boiler Heating Coil', isOn: false },
  floorHeating: { id: 'floor_heat', name: 'Heated Floors', level: 40 },
  dieselHeater: {
    status: 'running',
    mode: 'temperature',
    setpoint: 22,
    powerLevel: 0,
    ventilationLevel: 0,
    timer: null,
    readings: {
        heaterTemp: 65,
        externalTemp: 8,
        voltage: 12.8,
        flameTemp: 350,
        panelTemp: 21,
    },
    errors: null,
  }
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [vanState, setVanState] = useState<VanState>(initialVanState);

  // Effect to simulate diesel heater state transitions
  useEffect(() => {
    const heaterStatus = vanState.dieselHeater.status;
    
    // Stable states, no transition needed
    if (heaterStatus === 'off' || heaterStatus === 'running') {
      return;
    }

    let timeoutId: number;

    if (heaterStatus === 'starting') {
      timeoutId = window.setTimeout(() => {
        setVanState(prevState => ({
          ...prevState,
          dieselHeater: { ...prevState.dieselHeater, status: 'warming_up' }
        }));
      }, 3000);
    } else if (heaterStatus === 'warming_up') {
      timeoutId = window.setTimeout(() => {
        setVanState(prevState => ({
          ...prevState,
          dieselHeater: { ...prevState.dieselHeater, status: 'running', errors: null } // Clear errors on successful run
        }));
      }, 5000);
    } else if (heaterStatus === 'shutting_down') {
      timeoutId = window.setTimeout(() => {
        setVanState(prevState => ({
          ...prevState,
          dieselHeater: { ...prevState.dieselHeater, status: 'off', mode: 'temperature' } // Reset to a default mode
        }));
      }, 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [vanState.dieselHeater.status]);


  const handleUpdate = (updateFn: (prevState: VanState) => VanState) => {
    // In a real app, you would also send this state to the backend.
    setVanState(updateFn);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView sensors={vanState.sensors} />;
      case 'controls':
        return <ControlsView lights={vanState.lights} switches={vanState.switches} onUpdate={handleUpdate} />;
      case 'heating':
        return <ClimateAndWaterView boiler={vanState.boiler} floorHeating={vanState.floorHeating} onUpdate={handleUpdate} dieselHeater={vanState.dieselHeater} />;
      default:
        return <DashboardView sensors={vanState.sensors} />;
    }
  };

  return (
    <div className="font-sans text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <main className="flex-grow p-4 md:p-6 pb-28">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;