import React, { useRef, useEffect } from 'react';
import { VanState } from '../types';
import SensorCard from '../components/SensorCard';
import { WaterDropIcon, TemperatureIcon, BatteryIcon } from '../components/Icons';

// --- New Physics-based Water Tank Animation ---

// A class to represent a single segment of the water surface
class WaterColumn {
    // Target height is the resting position
    targetHeight: number;
    // Current height
    y: number;
    // Vertical velocity
    vy: number;

    constructor(targetHeight: number) {
        this.targetHeight = targetHeight;
        this.y = targetHeight;
        this.vy = 0;
    }

    // Update the column's physics based on tension and damping
    update(damping: number, tension: number) {
        const displacement = this.y - this.targetHeight;
        const acceleration = -tension * displacement - this.vy * damping;

        this.vy += acceleration;
        this.y += this.vy;
    }
}

interface PhysicsWaterTankProps {
    level: number;
    color: string;
}

const PhysicsWaterTank: React.FC<PhysicsWaterTankProps> = ({ level, color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const parent = canvas.parentElement;
        if (!parent) return;

        // Set canvas resolution to match its container size
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const { width, height } = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Physics constants for the simulation
        const TENSION = 0.005;
        const DAMPING = 0.005;
        const SPREAD = 0.05;
        const NUM_COLUMNS = Math.floor(width / 4);

        const waterBaseLevel = height * (1 - level / 100);
        const columns: WaterColumn[] = [];

        for (let i = 0; i < NUM_COLUMNS; i++) {
            columns.push(new WaterColumn(waterBaseLevel));
        }
        
        const updateWater = () => {
            for (const column of columns) {
                column.update(DAMPING, TENSION);
            }

            const leftDeltas = new Array(NUM_COLUMNS).fill(0);
            const rightDeltas = new Array(NUM_COLUMNS).fill(0);

            for (let j = 0; j < 5; j++) { // Run simulation multiple times for stability
                for (let i = 0; i < NUM_COLUMNS; i++) {
                    if (i > 0) {
                        leftDeltas[i] = SPREAD * (columns[i].y - columns[i - 1].y);
                        columns[i - 1].vy += leftDeltas[i];
                    }
                    if (i < NUM_COLUMNS - 1) {
                        rightDeltas[i] = SPREAD * (columns[i].y - columns[i + 1].y);
                        columns[i + 1].vy += rightDeltas[i];
                    }
                }

                for (let i = 0; i < NUM_COLUMNS; i++) {
                    if (i > 0) columns[i - 1].y += leftDeltas[i];
                    if (i < NUM_COLUMNS - 1) columns[i + 1].y += rightDeltas[i];
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            const gradient = ctx.createLinearGradient(0, waterBaseLevel - 50, 0, height);
            
            const [r, g, b] = color.match(/\w\w/g)!.map(hex => parseInt(hex, 16));
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.9)`);
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(0, height);

            let prevX = 0;
            let prevY = columns.length > 0 ? columns[0].y : height;
            ctx.lineTo(prevX, prevY);

            for (let i = 1; i < NUM_COLUMNS; i++) {
                const x = (i / (NUM_COLUMNS - 1)) * width;
                const y = columns[i].y;
                
                const midX = (prevX + x) / 2;
                const midY = (prevY + y) / 2;
                
                ctx.quadraticCurveTo(prevX, prevY, midX, midY);

                prevX = x;
                prevY = y;
            }
            
            ctx.lineTo(width, columns[NUM_COLUMNS - 1].y);
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();
        };
        
        let animationFrameId: number;
        let time = 0;
        
        const animate = () => {
            const sloshAmount = 10;
            const sloshSpeed = 0.02;
            const tilt = Math.sin(time * sloshSpeed) * sloshAmount;

            for (let i = 0; i < NUM_COLUMNS; i++) {
                const columnTilt = ((i / NUM_COLUMNS) - 0.5) * tilt;
                columns[i].targetHeight = waterBaseLevel + columnTilt;
            }

            if (Math.random() < 0.005) {
                const randomColumnIndex = Math.floor(Math.random() * NUM_COLUMNS);
                columns[randomColumnIndex].vy = -5; 
            }

            updateWater();
            draw();
            
            time++;
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleCanvasClick = (event: MouseEvent) => {
            const clickRect = canvas.getBoundingClientRect();
            const clickX = event.clientX - clickRect.left;
            const columnIndex = Math.floor((clickX / width) * NUM_COLUMNS);
            
            if (columnIndex >= 0 && columnIndex < NUM_COLUMNS) {
                columns[columnIndex].vy = -20;
            }
        };

        canvas.addEventListener('mousedown', handleCanvasClick);
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousedown', handleCanvasClick);
        };
    }, [level, color]);

    return <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" aria-label="Interactive animated water tank" />;
};


// --- End of new Water Tank ---

const getBatteryColor = (soc: number): string => {
    if (soc < 20) return 'text-red-500';
    return 'text-blue-500';
};

const LineChart: React.FC<{ data: { time: number; temp: number }[], isHot: boolean }> = ({ data, isHot }) => {
    if (!data || data.length < 2) return <div className="text-center text-gray-500">Not enough data for chart</div>;

    const width = 300;
    const height = 100;
    const padding = 5;

    const minTemp = Math.min(...data.map(d => d.temp));
    const maxTemp = Math.max(...data.map(d => d.temp));
    const startTime = data[0].time;
    const endTime = data[data.length - 1].time;

    const getX = (time: number) => ((time - startTime) / (endTime - startTime)) * (width - padding * 2) + padding;
    const getY = (temp: number) => height - padding - ((temp - minTemp) / (maxTemp - minTemp)) * (height - padding * 2);

    const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.time)} ${getY(d.temp)}`).join(' ');
    
    const areaPathData = `${pathData} V ${height} L ${padding} ${height} Z`;
    
    const lineStrokeColor = isHot ? "#EF4444" : "#3B82F6"; // Red if hot, blue otherwise

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaGradientBlue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="areaGradientRed" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPathData} fill={isHot ? "url(#areaGradientRed)" : "url(#areaGradientBlue)"} className="transition-all duration-500 ease-in-out" />
            <path d={pathData} fill="none" stroke={lineStrokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 ease-in-out" />
        </svg>
    );
};

const BatteryStatus: React.FC<{ soc: number; voltage: number; amperage: number }> = ({ soc, voltage, amperage }) => {
    const radius = 58;
    const stroke = 12;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (soc / 100) * circumference;

    const batteryColorClass = getBatteryColor(soc);
    const amperageColor = amperage > 0 ? 'text-blue-500' : 'text-red-500';

    return (
        <div className="flex flex-col items-center w-full">
            <div className="relative w-48 h-48">
                <svg
                    height="100%"
                    width="100%"
                    viewBox="0 0 140 140"
                    className="-rotate-90"
                >
                    <circle
                        className="text-gray-200 dark:text-gray-700"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={radius}
                        cx="70"
                        cy="70"
                    />
                    <circle
                        className={`${batteryColorClass} transition-colors duration-500`}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="70"
                        cy="70"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold text-gray-900 dark:text-white`}>
                        {soc}
                        <span className="text-3xl">%</span>
                    </span>
                </div>
            </div>
            <div className="flex justify-around w-full mt-2 text-center">
                <div>
                    <p className="text-base text-gray-500 dark:text-gray-400">Voltage</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{voltage.toFixed(1)}V</p>
                </div>
                <div>
                    <p className="text-base text-gray-500 dark:text-gray-400">Current</p>
                    <p className={`text-xl font-semibold ${amperageColor}`}>{amperage.toFixed(1)}A</p>
                </div>
            </div>
        </div>
    );
};

// --- New Temperature Gradient Logic ---

const getOutsideTempGradientClass = (temp: number): string => {
  if (temp < 5) return 'from-indigo-700/50 to-purple-800/50'; // Very cold
  if (temp < 15) return 'from-sky-600/50 to-indigo-600/50';   // Cool
  if (temp < 25) return 'from-cyan-500/50 to-sky-500/50';     // Mild
  return 'from-teal-400/50 to-cyan-400/50';               // Warm
};

const getCabinTempGradientClass = (temp: number): string => {
  if (temp < 18) return 'from-sky-600/50 to-indigo-600/50';   // Cool
  if (temp < 24) return 'from-cyan-500/50 to-sky-500/50';     // Comfy
  return 'from-teal-400/50 to-cyan-400/50';               // Warm
};


interface DashboardViewProps {
    sensors: VanState['sensors'];
}

const DashboardView: React.FC<DashboardViewProps> = ({ sensors }) => {
    const isBoilerHot = sensors.boilerTemp > 40;

    const boilerCardClass = isBoilerHot 
        ? 'bg-gradient-to-t from-red-500/10 via-white to-white dark:from-red-900/30 dark:via-gray-800/80 dark:to-gray-800/80' 
        : '';
    const boilerValueClass = isBoilerHot ? 'text-red-500' : '';
    
    const outsideTempGradient = getOutsideTempGradientClass(sensors.outsideTemp);
    const cabinTempGradient = getCabinTempGradientClass(sensors.insideTemp);

    const tempValueClass = "text-white drop-shadow-sm";

    return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2">
            <SensorCard icon={<BatteryIcon className="w-6 h-6"/>} title="Battery Status" value="">
                <BatteryStatus soc={sensors.batterySoC} voltage={sensors.batteryVoltage} amperage={sensors.batteryAmperage}/>
            </SensorCard>
        </div>
        <div className="col-span-2">
            <SensorCard 
                icon={<TemperatureIcon className="w-6 h-6"/>} 
                title="Boiler Temperature" 
                value={<span className={boilerValueClass}>{`${sensors.boilerTemp}°C`}</span>}
                className={boilerCardClass}
            >
                <div className="w-full h-full max-h-40">
                    <LineChart data={sensors.boilerTempHistory} isHot={isBoilerHot} />
                </div>
                <p className="text-sm text-center text-gray-400 mt-1">Last 12 Hours</p>
            </SensorCard>
        </div>
        
        <div className="col-span-1">
            <SensorCard 
                icon={<TemperatureIcon className="w-6 h-6"/>} 
                title="Cabin Temp" 
                value={<span className={tempValueClass}>{`${sensors.insideTemp.toFixed(1)}°C`}</span>}
                className={`bg-gradient-to-br transition-all duration-1000 ease-in-out ${cabinTempGradient}`}
            />
        </div>

        <div className="col-span-1">
            <SensorCard 
                icon={<TemperatureIcon className="w-6 h-6"/>} 
                title="Outside Temp" 
                value={<span className={tempValueClass}>{`${sensors.outsideTemp.toFixed(1)}°C`}</span>}
                className={`bg-gradient-to-br transition-all duration-1000 ease-in-out ${outsideTempGradient}`}
            />
        </div>

        <div className="col-span-2">
            <SensorCard icon={<WaterDropIcon className="w-6 h-6"/>} title="Water Levels" value="">
                <div className="flex space-x-2 justify-center pt-2 w-full">
                    <div className="flex flex-col items-center w-1/2">
                        <div className="relative w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <PhysicsWaterTank level={sensors.freshWater} color="#3B82F6" />
                            <span className="absolute bottom-1 left-0 right-0 text-center text-xl font-bold text-white pointer-events-none">{sensors.freshWater}%</span>
                        </div>
                        <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fresh</span>
                    </div>
                    <div className="flex flex-col items-center w-1/2">
                         <div className="relative w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <PhysicsWaterTank level={sensors.grayWater} color="#6B7280" />
                            <span className="absolute bottom-1 left-0 right-0 text-center text-xl font-bold text-white pointer-events-none">{sensors.grayWater}%</span>
                        </div>
                        <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gray</span>
                    </div>
                </div>
            </SensorCard>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;