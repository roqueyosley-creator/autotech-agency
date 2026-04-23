import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Activity, Play, Pause, Trash2, Maximize2 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Osciloscopio Avanzado de Sensores OBD
 */
const AdvancedTelemetry = ({ liveData }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [history, setHistory] = useState({
        labels: Array(50).fill(''),
        datasets: [
            {
                label: 'RPM',
                data: Array(50).fill(0),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: true,
            },
            {
                label: 'Load %',
                data: Array(50).fill(0),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: true,
            }
        ]
    });

    const maxPoints = 60;

    useEffect(() => {
        if (isPaused || !liveData) return;

        setHistory(prev => {
            const newLabels = [...prev.labels, new Date().toLocaleTimeString().split(' ')[0]];
            if (newLabels.length > maxPoints) newLabels.shift();

            const newDatasets = prev.datasets.map(ds => {
                let newValue = 0;
                if (ds.label === 'RPM') newValue = liveData.rpm || 0;
                if (ds.label === 'Load %') newValue = liveData.load || 0;

                const newData = [...ds.data, newValue];
                if (newData.length > maxPoints) newData.shift();
                return { ...ds, data: newData };
            });

            return { labels: newLabels, datasets: newDatasets };
        });
    }, [liveData, isPaused]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 }, // Para rendimiento en tiempo real
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#71717a', font: { size: 10 } }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: '#fff', usePointStyle: true, boxWidth: 6, font: { size: 11 } }
            },
            tooltip: { enabled: false }
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                        <Activity size={20} className={!isPaused ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">Telemetría Avanzada</h3>
                        <p className="text-zinc-500 text-xs font-medium">Modo Osciloscopio Real-Time</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsPaused(!isPaused)}
                        className={`p-2 rounded-lg transition-all ${isPaused ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                    >
                        {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                    </button>
                    <button className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-all">
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 w-full bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50">
                <Line data={history} options={options} />
            </div>

            {/* Status Footer */}
            <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                <div className="flex gap-4">
                    <span className="text-blue-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> RPM: {liveData?.rpm || 0}
                    </span>
                    <span className="text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> LOAD: {liveData?.load || 0}%
                    </span>
                </div>
                <span className="text-zinc-600">Sample Rate: 10Hz</span>
            </div>
            
            {/* Grid Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
        </div>
    );
};

export default AdvancedTelemetry;
