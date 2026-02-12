import { Plan } from '../types';

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 50,
    dailyPercentage: 0.5,
    features: ['Acceso a señales básicas', 'Soporte por email', 'Retiros en 48h'],
    color: 'border-gray-500',
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    price: 200,
    dailyPercentage: 0.85,
    features: ['Acceso a todas las señales', 'Soporte prioritario', 'Retiros en 24h', 'Análisis diario'],
    color: 'border-blue-500',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    dailyPercentage: 1.5,
    features: ['Señales VIP exclusivas', 'Soporte 24/7', 'Retiros en 4h', 'Análisis personalizado', 'Señales de Scalping'],
    color: 'border-gold',
  },
];

export const getPlanById = (id: string): Plan | undefined => {
  return plans.find((plan: Plan) => plan.id === id);
};
