import React, { useState, useEffect } from 'react';
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
} from 'chart.js';
import { motion } from 'framer-motion';
import { BarChart3, Settings2 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ComparisonDashboard = ({ liveData }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Parámetro A',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: 'Parámetro B',
                data: [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
            }
        ],
    });

    const [paramA, setParamA] = useState('rpm');
    const [paramB, setParamB] = useState('temp');

    useEffect(() => {
        const timer = setInterval(() => {
            setChartData(prev => {
                const newLabels = [...prev.labels, new Date().toLocaleTimeString()];
                if (newLabels.length > 20) newLabels.shift();

                const newDataA = [...prev.datasets[0].data, liveData[paramA] || 0];
                if (newDataA.length > 20) newDataA.shift();

                const newDataB = [...prev.datasets[1].data, liveData[paramB] || 0];
                if (newDataB.length > 20) newDataB.shift();

                return {
                    ...prev,
                    labels: newLabels,
                    datasets: [
                        { ...prev.datasets[0], data: newDataA, label: paramA.toUpperCase() },
                        { ...prev.datasets[1], data: newDataB, label: paramB.toUpperCase() },
                    ]
                };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [liveData, paramA, paramB]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: '#71717a', font: { weight: 'bold', size: 10 }, usePointStyle: true }
            },
            tooltip: { enabled: true }
        },
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#52525b', font: { size: 10 } }
            }
        },
        animation: { duration: 0 }
    };

    const params = [
        { id: 'rpm', name: 'RPM' },
        { id: 'temp', name: 'Temperatura' },
        { id: 'engineLoad', name: 'Carga' },
        { id: 'battery', name: 'Voltaje' }
    ];

    return (
        <div className="p-6 bg-zinc-950/50 rounded-[2.5rem] border border-zinc-900 backdrop-blur-xl">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Comparativa en Vivo</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold italic">Dual-Channel Sync Analysis</p>
                </div>
                <BarChart3 className="text-blue-500 w-5 h-5" />
            </header>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <span className="text-[8px] font-black uppercase text-zinc-600 tracking-tighter ml-2">Canal A</span>
                    <select 
                        value={paramA} 
                        onChange={(e) => setParamA(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] p-3 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                        {params.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[8px] font-black uppercase text-zinc-600 tracking-tighter ml-2">Canal B</span>
                    <select 
                        value={paramB} 
                        onChange={(e) => setParamB(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                    >
                        {params.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="h-64 mb-4 relative">
                <Line data={chartData} options={options} />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[9px] font-bold text-zinc-400">{paramA.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-bold text-zinc-400">{paramB.toUpperCase()}</span>
                    </div>
                </div>
                <Settings2 className="text-zinc-700 w-4 h-4 cursor-pointer hover:text-zinc-500 transition-colors" />
            </div>
        </div>
    );
};

export default ComparisonDashboard;
