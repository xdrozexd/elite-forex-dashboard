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
  Filler,
  ChartOptions,
} from 'chart.js';
import { useApp } from '../hooks/useApp';

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

export const GrowthChart = () => {
  const { dailyUpdates, balance } = useApp();

  const data = {
    labels: dailyUpdates.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Balance',
        data: dailyUpdates.map((_, i) => {
          let total = 100;
          for (let j = 1; j <= i; j++) {
            total += (total * dailyUpdates[j].percentage) / 100;
          }
          return total;
        }),
        fill: true,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `$${context.parsed.y?.toFixed(2) || '0.00'}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📈 Evolución de tu Inversión</h3>
        <span className="text-sm text-primary font-semibold">+${(balance - 100).toFixed(2)} total</span>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
