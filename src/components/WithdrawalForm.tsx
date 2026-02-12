import { useState } from 'react';
import { useApp } from '../hooks/useApp';

export const WithdrawalForm = () => {
  const { balance, requestWithdrawal } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawalAmount = parseFloat(amount);
    
    if (isNaN(withdrawalAmount)) {
      setMessage('Por favor ingresa un monto válido');
      return;
    }
    
    if (withdrawalAmount < 50) {
      setMessage('El monto mínimo de retiro es $50');
      return;
    }
    
    if (withdrawalAmount > balance) {
      setMessage('No tienes suficiente saldo');
      return;
    }
    
    requestWithdrawal(withdrawalAmount);
    setAmount('');
    setMessage('Retiro solicitado exitosamente. Procesaremos tu pago en 24-48 horas.');
    
    setTimeout(() => setMessage(''), 4000);
  };

  const handleQuickAmount = (percent: number) => {
    const quickAmount = (balance * percent).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-5">
      <h3 className="text-lg font-bold text-white mb-4">💰 Solicitar Retiro</h3>
      
      <div className="mb-4 p-3 bg-dark rounded-lg">
        <p className="text-sm text-gray-400">Saldo disponible</p>
        <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Monto del retiro (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Mínimo $50"
            className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {[0.25, 0.5, 0.75, 1].map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => handleQuickAmount(percent)}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
            >
              {Math.round(percent * 100)}%
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={balance < 50}
          className="w-full py-3 bg-primary hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-bold text-dark transition-colors"
        >
          Solicitar Retiro
        </button>

        {message && (
          <p className={`text-sm text-center ${message.includes('exitosamente') ? 'text-primary' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Los retiros se procesan en 4-48 horas dependiendo de tu plan
      </p>
    </div>
  );
};
