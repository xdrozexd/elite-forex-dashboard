import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartNoAxesCombined,
  TrendingUp,
  Wallet,
  Users,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';

const plans = [
  { name: 'Básico', price: 50, rate: 0.5, color: 'from-slate-500 to-slate-600' },
  { name: 'Intermedio', price: 200, rate: 0.85, color: 'from-primary to-emerald-600', popular: true },
  { name: 'Premium', price: 500, rate: 1.5, color: 'from-amber-500 to-yellow-600' },
];

const features = [
  { icon: TrendingUp, title: 'Rendimientos Diario', desc: '0.5% - 1.5% diario garantizado' },
  { icon: Shield, title: 'Seguro y Protegido', desc: 'Encriptación de grado militar' },
  { icon: Wallet, title: 'Retiros Rápidos', desc: 'Desde 4 horas hasta 48 horas' },
  { icon: Users, title: 'Comunidad VIP', desc: 'Soporte 24/7 y señales exclusivas' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <ChartNoAxesCombined className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Elite Forex</h1>
            <p className="text-xs text-muted-foreground">Trading Automatizado</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Rendimientos Diarios Automáticos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Invierte y Gana
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Únete a miles de inversores que ya generan ingresos pasivos con nuestras señales de trading automatizadas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="premium" onClick={() => navigate('/register')} className="gap-2">
              Registrarse <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Card className="border-0 shadow-xl h-full">
                <CardContent className="p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-bold mb-6">Nuestros Planes</h3>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className={`relative p-6 rounded-2xl border transition-all hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-primary/20 to-transparent border-primary shadow-lg shadow-primary/20'
                    : 'bg-card/50 border-border/50'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Más Popular</Badge>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 mx-auto`}>
                  <span className="text-xl">💰</span>
                </div>
                <h4 className="font-bold text-lg mb-1">{plan.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">Inversión mínima ${plan.price}</p>
                <p className="text-3xl font-bold text-primary">{plan.rate}%</p>
                <p className="text-xs text-muted-foreground">por día</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-gold/10">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">¿Por qué elegir Elite Forex?</h3>
              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-left">
                {[
                  'Señales de trading automatizadas',
                  'Retiros rápidos y seguros',
                  'Soporte 24/7 disponible',
                  'Plataforma regulada',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 p-4 rounded-xl bg-secondary/30 border border-border/50 text-center"
        >
          <p className="text-sm text-muted-foreground">
            ⚠️ <strong>Disclaimer:</strong> Las inversiones en forex implican riesgos. Los rendimientos pasados no garantizan resultados futuros.
            Invierte responsablemente.
          </p>
        </motion.div>
      </main>
    </div>
  );
};
