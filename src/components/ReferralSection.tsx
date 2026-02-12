import { useApp } from '../hooks/useApp';

export const ReferralSection = () => {
  const { referralLink, referrals } = useApp();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('¡Enlace copiado al portapapeles!');
  };

  const estimatedEarnings = referrals * 15;

  return (
    <div className="bg-gray-800/50 rounded-2xl p-5">
      <h3 className="text-lg font-bold text-white mb-4">🎁 Programa de Referidos</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-dark rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gold">{referrals}</p>
          <p className="text-xs text-gray-400">Referidos</p>
        </div>
        <div className="bg-dark rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">${estimatedEarnings}</p>
          <p className="text-xs text-gray-400">Ganancias</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Tu enlace de referido</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-3 py-2 bg-dark border border-gray-700 rounded-lg text-sm text-gray-300"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-primary hover:bg-green-500 rounded-lg text-dark font-bold text-sm transition-colors"
          >
            Copiar
          </button>
        </div>
      </div>

      <div className="bg-dark rounded-lg p-3">
        <p className="text-sm text-gray-300">
          <span className="text-primary font-bold">+$15</span> por cada referido que se registre con tu enlace
        </p>
      </div>
    </div>
  );
};
