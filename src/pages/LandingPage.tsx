import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ChartNoAxesCombined,
  TrendingUp,
  Wallet,
  Users,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 50,
    dailyRate: 0.5,
    features: ['Señales básicas', 'Retiros en 48h', 'Soporte email'],
    popular: false,
    color: 'from-slate-500 to-slate-600',
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    price: 200,
    dailyRate: 0.85,
    features: ['Señales avanzadas', 'Retiros en 24h', 'Soporte priority', 'Análisis diario'],
    popular: true,
    color: 'from-primary to-emerald-600',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    dailyRate: 1.5,
    features: ['Señales VIP', 'Retiros en 4h', 'Soporte 24/7', 'Análisis avanzado', 'Señales en tiempo real'],
    popular: false,
    color: 'from-amber-500 to-yellow-600',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loginWithTelegram, loginWithGoogle, error, clearError } = useAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
    plan: 'basic',
  });
  const [isFormLoading, setIsFormLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    clearError();

    try {
      if (!formData.email.trim()) throw new Error('Ingresa tu email');
      if (!formData.password) throw new Error('Ingresa tu contraseña');
      
      if (!isLogin) {
        if (!formData.username.trim()) throw new Error('Ingresa un username');
        if (formData.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
        if (formData.password !== formData.confirmPassword) throw new Error('Las contraseñas no coinciden');
        await register(formData.email, formData.password, formData.username, formData.plan);
      } else {
        await login(formData.email, formData.password);
      }
      
      toast({ title: '¡Bienvenido!', description: 'Redirigiendo al dashboard...', variant: 'success' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Ocurrió un error', variant: 'destructive' });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleTelegramLogin = async () => {
    try {
      await loginWithTelegram();
      toast({ title: '¡Bienvenido!', description: 'Redirigiendo al dashboard...', variant: 'success' });
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo iniciar con Telegram', variant: 'destructive' });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({ title: '¡Bienvenido!', description: 'Redirigiendo al dashboard...', variant: 'success' });
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo iniciar con Google', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <header className="p-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <ChartNoAxesCombined className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Elite Forex</h1>
              <p className="text-xs text-muted-foreground">Trading Automatizado</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge variant="success" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Demo Live
            </Badge>
          </motion.div>
        </header>

        <main className="container mx-auto px-4 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12 mt-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Rendimientos Diarios Automáticos</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Invierte y Gana
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Únete a miles de inversores que ya generan ingresos pasivos con nuestras señales de trading automatizadas.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Características
                  </CardTitle>
                  <CardDescription>Por qué elegir Elite Forex</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {[
                    { icon: TrendingUp, title: 'Rendimientos Diario', desc: '0.5% - 1.5% diario garantizado' },
                    { icon: Shield, title: 'Seguro y Protegido', desc: 'Encriptación de grado militar' },
                    { icon: Wallet, title: 'Retiros Rápidos', desc: 'Desde 4 horas hasta 48 horas' },
                    { icon: Users, title: 'Comunidad VIP', desc: 'Soporte 24/7 y señales exclusivas' },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-2xl shadow-gold/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />
                <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
                  <div className="relative p-6 pb-0">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                      <TabsTrigger value="register">Registrarse</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="login" className="p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        icon={<span className="text-lg">📧</span>}
                      />
                      <Input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        icon={<span className="text-lg">🔒</span>}
                      />
                      {error && <p className="text-sm text-destructive text-center">{error}</p>}
                      <Button type="submit" className="w-full" size="lg" loading={isFormLoading}>
                        Iniciar Sesión
                      </Button>
                    </form>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">o continúa con</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={handleTelegramLogin} className="gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.696.065-1.225-.46-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Telegram
                      </Button>
                      <Button variant="outline" onClick={handleGoogleLogin} className="gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        name="username"
                        type="text"
                        placeholder="Tu username"
                        value={formData.username}
                        onChange={handleChange}
                        icon={<span className="text-lg">👤</span>}
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        icon={<span className="text-lg">📧</span>}
                      />
                      <Input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        icon={<span className="text-lg">🔒</span>}
                      />
                      <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={<span className="text-lg">🔐</span>}
                      />
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Plan de inversión</label>
                        <select
                          name="plan"
                          value={formData.plan}
                          onChange={handleChange}
                          className="w-full h-12 rounded-xl bg-secondary/50 px-4 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="basic">Básico - $50 (0.5%/día)</option>
                          <option value="intermediate">Intermedio - $200 (0.85%/día)</option>
                          <option value="premium">Premium - $500 (1.5%/día)</option>
                        </select>
                      </div>
                      {error && <p className="text-sm text-destructive text-center">{error}</p>}
                      <Button type="submit" variant="premium" className="w-full" size="lg" loading={isFormLoading}>
                        Crear Cuenta
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </Card>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <h3 className="text-lg font-semibold text-center mb-4">Nuestros Planes</h3>
                <div className="grid gap-4">
                  {plans.map((plan, i) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className={cn(
                        'relative p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02]',
                        'bg-card/50 backdrop-blur-xl',
                        plan.popular && 'border-primary shadow-lg shadow-primary/20'
                      )}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 -right-2 gap-1">
                          <Star className="w-3 h-3" /> Popular
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', plan.color)}>
                            <span className="text-lg">💰</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{plan.name}</h4>
                            <p className="text-sm text-muted-foreground">Inversión mínima ${plan.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{plan.dailyRate}%</p>
                          <p className="text-xs text-muted-foreground">por día</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 p-4 rounded-xl bg-secondary/30 border border-border/50 text-center"
          >
            <p className="text-sm text-muted-foreground">
              ⚠️ <strong>Disclaimer:</strong> Las inversiones en forex implican riesgos. Los rendimientos pasados no garantizan resultados futuros.
              Invierte responsablemente.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
