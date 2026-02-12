import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  isPopular?: boolean;
  onSelect: (plan: Plan) => void;
}

export const PlanCard = ({ plan, isPopular, onSelect }: PlanCardProps) => {
  const estimatedMonthly = (plan.price * (plan.dailyPercentage / 100) * 30).toFixed(2);
  const estimatedYearly = (plan.price * (plan.dailyPercentage / 100) * 365).toFixed(2);

  return (
    <div className={`relative bg-gray-800/50 rounded-2xl p-5 border-2 ${plan.color} hover:scale-[1.02] transition-transform duration-300`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-dark px-4 py-1 rounded-full text-sm font-bold">
          ⭐ Más Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-primary">${plan.price}</span>
        <span className="text-gray-400 ml-1">inicial</span>
      </div>
      <div className="bg-dark rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-400">Rendimiento diario</p>
        <p className="text-2xl font-bold text-primary">+{plan.dailyPercentage}%</p>
        <p className="text-xs text-gray-500 mt-1">
          ${estimatedMonthly}/mes • ${estimatedYearly}/año estimados
        </p>
      </div>
      <ul className="space-y-2 mb-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-xl font-bold text-dark transition-colors ${
          isPopular ? 'bg-gold hover:bg-yellow-400' : 'bg-primary hover:bg-green-500'
        }`}
      >
        {plan.id === 'premium' ? 'Suscribirme' : 'Elegir mi Plan'}
      </button>
    </div>
  );
};
