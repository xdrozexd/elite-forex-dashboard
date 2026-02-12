import { useApp } from '../hooks/useApp';

export const BalanceCard = () => {
  const { balance, currentPlan, simulateDailyUpdate } = useApp();

  return (
    <div className="bg-gradient-to-br from-primary/20 to-gold/10 rounded-2xl p-5 border border-primary/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400">Saldo Actual</p>
          <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
        </div>
        <button
          onClick={simulateDailyUpdate}
          className="px-3 py-1 bg-gold hover:bg-yellow-400 rounded-lg text-dark text-xs font-bold transition-colors"
        >
          ⏰ Simular 6PM
        </button>
      </div>

      {currentPlan ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Plan activo:</span>
            <span className="text-primary font-semibold">{currentPlan.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Rendimiento diario:</span>
            <span className="text-gold font-semibold">+{currentPlan.dailyPercentage}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Próxima actualización:</span>
            <span className="text-white font-semibold">18:00 (en ~{Math.max(1, 18 - new Date().getHours())}h)</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No tienes un plan activo</p>
      )}
    </div>
  );
};
