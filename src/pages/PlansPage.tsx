import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Disclaimer } from '../components/Disclaimer';
import { plans, useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';

export const PlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPlan } = useApp();
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);

  const preselectedPlan = location.state?.plan;

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (user) {
      setPlan(plan);
      setSubscribed(true);
    }
  };

  if (subscribed) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a Elite Forex!</h2>
          <p className="text-gray-400 mb-6">Tu plan ha sido activado exitosamente</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="py-3 px-8 bg-primary hover:bg-green-500 rounded-xl font-bold text-dark transition-colors"
          >
            Ir al Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-md mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          ← Volver
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">Elige tu Plan</h1>
        <p className="text-gray-400 mb-6">Compara nuestras opciones y encuentra la mejor para ti</p>

        <div className="space-y-4 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 border-2 ${
                preselectedPlan?.id === plan.id
                  ? `${plan.color} bg-gray-800/70`
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary">${plan.price}</p>
                </div>
                {preselectedPlan?.id === plan.id && (
                  <span className="bg-primary text-dark px-2 py-1 rounded-lg text-xs font-bold">
                    Recomendado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="bg-dark rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Diario</p>
                  <p className="text-primary font-bold">+{plan.dailyPercentage}%</p>
                </div>
                <div className="bg-dark rounded-lg p-2">
                  <p className="text-gray-400 text-xs">Mensual est.</p>
                  <p className="text-gold font-bold">${(plan.price * plan.dailyPercentage * 30 / 100).toFixed(0)}</p>
                </div>
              </div>

              <ul className="space-y-1 mb-3">
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
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-2 rounded-lg font-bold text-dark transition-colors ${
                  plan.id === 'premium' ? 'bg-gold hover:bg-yellow-400' : 'bg-primary hover:bg-green-500'
                }`}
              >
                Suscribirme
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-4 mb-6">
          <h4 className="font-bold text-white mb-2">📊 Comparativa Detallada</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left py-2">Característica</th>
                <th className="text-center py-2">Básico</th>
                <th className="text-center py-2">Intermedio</th>
                <th className="text-center py-2">Premium</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr>
                <td className="py-2">Rendimiento diario</td>
                <td className="text-center text-primary">0.5%</td>
                <td className="text-center text-primary">0.85%</td>
                <td className="text-center text-gold">1.5%</td>
              </tr>
              <tr>
                <td className="py-2">Tiempo de retiro</td>
                <td className="text-center">48h</td>
                <td className="text-center">24h</td>
                <td className="text-center">4h</td>
              </tr>
              <tr>
                <td className="py-2">Señales diarias</td>
                <td className="text-center">3</td>
                <td className="text-center">10</td>
                <td className="text-center">Ilimitadas</td>
              </tr>
              <tr>
                <td className="py-2">Soporte</td>
                <td className="text-center">Email</td>
                <td className="text-center">Prioritario</td>
                <td className="text-center">24/7</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Disclaimer />

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ¿Tienes preguntas? Escríbenos a support@eliteforex.com
          </p>
        </div>
      </div>
    </div>
  );
};
