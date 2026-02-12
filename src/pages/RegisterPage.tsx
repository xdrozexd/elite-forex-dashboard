import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChartNoAxesCombined, Mail, Lock, User, ArrowLeft, Check, Sparkles } from 'lucide-react';

const plans = [
  { id: 'basic', name: 'Básico', price: 50, rate: 0.5 },
  { id: 'intermediate', name: 'Intermedio', price: 200, rate: 0.85 },
  { id: 'premium', name: 'Premium', price: 500, rate: 1.5 },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
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
      if (!formData.username.trim()) throw new Error('Ingresa tu username');
      if (!formData.email.trim()) throw new Error('Ingresa tu email');
      if (formData.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
      if (formData.password !== formData.confirmPassword) throw new Error('Las contraseñas no coinciden');

      await register(formData.email, formData.password, formData.username, formData.plan);
      toast({ title: '¡Cuenta creada!', description: 'Bienvenido a Elite Forex', variant: 'success' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo crear la cuenta', variant: 'destructive' });
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 p-4 pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-0 shadow-2xl mb-6">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <ChartNoAxesCombined className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription>Únete a Elite Forex y comienza a invertir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="username"
                  type="text"
                  placeholder="Tu username"
                  value={formData.username}
                  onChange={handleChange}
                  icon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <p className="text-sm text-destructive text-center">{error}</p>
                  </div>
                )}
                <Button type="submit" variant="premium" className="w-full" size="lg" loading={isFormLoading} disabled={isLoading}>
                  Crear Cuenta
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Selecciona tu plan</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id })}
                  className={`p-3 rounded-xl border transition-all ${
                    formData.plan === plan.id
                      ? 'bg-primary/20 border-primary'
                      : 'bg-card/50 border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">${plan.price}</p>
                  <p className="text-lg font-bold text-primary">{plan.rate}%</p>
                  <p className="text-[10px] text-muted-foreground">/día</p>
                  {formData.plan === plan.id && <Check className="w-4 h-4 text-primary mx-auto mt-1" />}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border/50"
          >
            <p className="text-xs text-muted-foreground text-center">
              Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
              Las inversiones implican riesgos.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
