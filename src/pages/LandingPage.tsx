import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanCard } from '../components/PlanCard';
import { Disclaimer } from '../components/Disclaimer';
import { plans } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    navigate('/plans', { state: { plan } });
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-primary/20 mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Genera Ingresos Diarios Automáticos con Señales Elite
          </h1>
          <p className="text-gray-400">
            Deposita desde <span className="text-primary font-bold">$50</span> y recibe hasta{' '}
            <span className="text-gold font-bold">1.5% diario</span>
          </p>
        </div>

        <div className="grid gap-4 mb-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPopular={plan.id === 'premium'}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-5 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 text-center">
            💰 Resultados Mensuales Estimados
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-dark rounded-xl">
              <p className="text-lg font-bold text-gray-400">$50</p>
              <p className="text-xs text-gray-500">Básico</p>
              <p className="text-sm text-primary">~$7.50/mes</p>
            </div>
            <div className="text-center p-3 bg-dark rounded-xl">
              <p className="text-lg font-bold text-blue-400">$200</p>
              <p className="text-xs text-gray-500">Intermedio</p>
              <p className="text-sm text-primary">~$51/mes</p>
            </div>
            <div className="text-center p-3 bg-dark rounded-xl">
              <p className="text-lg font-bold text-gold">$500</p>
              <p className="text-xs text-gray-500">Premium</p>
              <p className="text-sm text-primary">~$225/mes</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/plans')}
          className="w-full py-4 bg-primary hover:bg-green-500 rounded-xl font-bold text-dark text-lg transition-colors mb-6"
        >
          Elegir mi Plan →
        </button>

        <Disclaimer />

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            🔒 Tu inversión está protegida con encriptación de grado militar
          </p>
        </div>
      </div>
    </div>
  );
};
