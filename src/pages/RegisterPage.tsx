import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import {
  ChartNoAxesCombined,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Check,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  Clock,
} from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 50,
    rate: 0.5,
    features: ['Señales básicas', 'Retiros 48h', 'Soporte email'],
    color: 'from-slate-500 to-slate-600',
    icon: TrendingUp,
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    price: 200,
    rate: 0.85,
    features: ['Señales avanzadas', 'Retiros 24h', 'Soporte priority', 'Análisis tiempo real'],
    color: 'from-green-500 to-emerald-600',
    icon: Zap,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    rate: 1.5,
    features: ['Señales VIP', 'Retiros 4h', 'Soporte 24/7', 'Account manager'],
    color: 'from-yellow-500 to-amber-600',
    icon: Clock,
  },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'intermediate',
  });
  const [isFormLoading, setIsFormLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    clearError();

    if (formData.password !== formData.confirmPassword) {
      // Error handled by context
      setIsFormLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.username, formData.plan);
      navigate('/dashboard');
    } catch {
      // Error handled by context
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-y-auto relative py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px]" />
        
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver</span>
      </motion.button>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 relative z-10 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/30"
            >
              <ChartNoAxesCombined className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Crear tu cuenta</h1>
            <p className="text-gray-400">Comienza a invertir con Elite Forex hoy</p>
          </div>

          {/* Form Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <GlassCard className="p-8 h-fit" glow="green">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Nombre de usuario</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      name="username"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-12 h-14 bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-12 h-14 bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12 h-14 bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-12 h-14 bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-green-500/20"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                  loading={isFormLoading || isLoading}
                >
                  Crear Cuenta Gratis
                </Button>
              </form>

              <p className="text-center mt-6 text-gray-400 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </GlassCard>

            {/* Plan Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                Selecciona tu plan
              </h3>
              
              <div className="space-y-4">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      formData.plan === plan.id
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        Popular
                      </Badge>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shrink-0`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-lg">{plan.name}</h4>
                          <div className="text-right">
                            <span className="text-2xl font-bold">${plan.price}</span>
                            <span className="text-sm text-gray-400 ml-2">/inversión</span>
                          </div>
                        </div>
                        
                        <p className="text-green-400 font-semibold mb-2">{plan.rate}% diario</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {plan.features.slice(0, 2).map((feature, j) => (
                            <span key={j} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        formData.plan === plan.id
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-600'
                      }`}>
                        {formData.plan === plan.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-sm">Tu inversión está protegida</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Encriptación SSL
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> 2FA Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Fondos Asegurados
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Soporte 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
