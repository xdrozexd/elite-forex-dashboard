import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { GlassCard } from '@/components/GlassCard';
import { ScrollProgress } from '@/components/ScrollProgress';
import {
  ChartNoAxesCombined,
  Shield,
  ArrowRight,
  Check,
  Star,
  Zap,
  Clock,
  BarChart3,
  TrendingUp,
  Wallet,
  MessageCircle,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  ChevronUp,
  Sparkles,
  Play,
  Lock,
  Globe,
  Award,
  CheckCircle2,
} from 'lucide-react';

const plans = [
  { 
    name: 'Básico', 
    price: 50, 
    rate: 0.5, 
    features: ['Señales básicas', 'Retiros en 48h', 'Soporte email', 'Dashboard completo'],
    popular: false 
  },
  { 
    name: 'Intermedio', 
    price: 200, 
    rate: 0.85, 
    features: ['Señales avanzadas', 'Retiros en 24h', 'Soporte priority', 'Análisis en tiempo real', 'Alertas personalizadas'],
    popular: true 
  },
  { 
    name: 'Premium', 
    price: 500, 
    rate: 1.5, 
    features: ['Señales VIP', 'Retiros en 4h', 'Soporte 24/7', 'Análisis avanzado', 'Account manager', 'Estrategias exclusivas'],
    popular: false 
  },
];

const features = [
  { icon: Zap, title: 'Trading Automatizado', desc: 'Algoritmos de IA operan 24/7 sin intervención humana' },
  { icon: Shield, title: 'Seguridad Bancaria', desc: 'Encriptación AES-256 y fondos asegurados hasta $250K' },
  { icon: Clock, title: 'Retiros Express', desc: 'Recibe tu dinero en 4-48 horas según tu plan' },
  { icon: BarChart3, title: 'Analytics Avanzado', desc: 'Datos en tiempo real con machine learning' },
  { icon: TrendingUp, title: 'ROI Comprobado', desc: 'Promedio histórico del 25-45% mensual' },
  { icon: Wallet, title: 'Múltiples Métodos', desc: 'Crypto, transferencias y tarjetas aceptadas' },
];

const testimonials = [
  { name: 'Carlos R.', role: 'Inversor desde 2023', text: 'Dupliqué mi inversión en 3 meses. Las señales son increíblemente precisas.', avatar: 'CR' },
  { name: 'María L.', role: 'Trader Profesional', text: 'La mejor plataforma que he usado. El soporte es excepcional.', avatar: 'ML' },
  { name: 'Juan P.', role: 'Empresario', text: 'Retiros rápidos y confiables. 100% recomendado.', avatar: 'JP' },
  { name: 'Ana S.', role: 'Inversora', text: 'El plan Premium vale cada centavo. Mi account manager es fantástico.', avatar: 'AS' },
];

const faqs = [
  { q: '¿Cuánto puedo ganar?', a: 'Los rendimientos varían según tu plan: Básico 0.5%, Intermedio 0.85%, Premium 1.5% diario. Históricamente nuestros usuarios ven retornos del 25-45% mensual.' },
  { q: '¿Es seguro invertir?', a: 'Absolutamente. Usamos encriptación AES-256 de grado militar, autenticación 2FA, y fondos están asegurados. Cumplimos con regulaciones internacionales.' },
  { q: '¿Cuándo puedo retirar?', a: 'Los retiros se procesan según tu plan: Premium (4h), Intermedio (24h), Básico (48h). No hay mínimo de retiro ni penalizaciones.' },
  { q: '¿Necesito experiencia?', a: 'No. Nuestro sistema es 100% automatizado. Solo necesitas crear una cuenta, elegir tu plan y nuestros algoritmos harán el resto.' },
];

const trustedBy = [
  'Forbes', 'Bloomberg', 'CoinDesk', 'TechCrunch', 'Yahoo Finance'
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-x-hidden relative">
      <ScrollProgress />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-green-500/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Navbar */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3 bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-white/10' : 'py-6 bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <ChartNoAxesCombined className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Elite Forex</span>
            </motion.div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Características', 'Planes', 'Testimonios', 'FAQ'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white"
              >
                Iniciar Sesión
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
              >
                Comenzar
              </Button>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-3">
            {['Características', 'Planes', 'Testimonios', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-gray-400 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button className="w-full mt-4" onClick={() => navigate('/register')}>
              Comenzar Ahora
            </Button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative min-h-screen flex items-center">
        <motion.div style={{ y }} className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 mb-6"
              >
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">Trading automatizado con IA</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
              >
                Invierte y Gana
                <br />
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-yellow-400 bg-clip-text text-transparent">
                  Sin Esfuerzo
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-400 max-w-xl mb-8 leading-relaxed"
              >
                Únete a <span className="text-white font-semibold">10,000+ inversores</span> que ya generan 
                ingresos pasivos con nuestras señales de trading automatizadas impulsadas por IA.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/register')} 
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/30 text-lg px-8 py-6"
                >
                  Comenzar Gratis <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="border-white/20 hover:bg-white/10 text-lg px-8 py-6"
                >
                  <Play className="w-5 h-5 mr-2" /> Ver Demo
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6"
              >
                {[
                  { icon: Lock, text: 'Seguro' },
                  { icon: CheckCircle2, text: 'Verificado' },
                  { icon: Globe, text: 'Global' },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <badge.icon className="w-4 h-4 text-green-500" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 10000, suffix: '+', label: 'Usuarios Activos', color: 'green' },
                { value: 2, suffix: 'M+', prefix: '$', label: 'Pagados', color: 'blue' },
                { value: 99.9, suffix: '%', label: 'Uptime', color: 'yellow' },
                { value: 4.9, suffix: '/5', label: 'Rating', color: 'purple' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`p-6 rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent hover:border-${stat.color}-500/50 transition-all duration-500 group`}
                >
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                    <AnimatedCounter 
                      end={stat.value} 
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      decimals={stat.value % 1 !== 0 ? 1 : 0}
                    />
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider">Destacado en</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
            {trustedBy.map((brand, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-xl font-bold text-gray-400 hover:text-white transition-colors cursor-default"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="características" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">Características</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Todo lo que necesitas para
              <span className="text-green-400"> invertir con éxito</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Tecnología de punta combinada con años de experiencia en trading
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <GlassCard key={i} delay={i * 0.1} glow="green" className="group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planes" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Planes</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Elige tu plan ideal
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Comienza desde $50 y escala según tus objetivos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -10 }}
                className={`relative p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-green-500/20 via-green-500/10 to-transparent border-green-500/50 shadow-2xl shadow-green-500/20 scale-105 z-10'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1">
                      <Star className="w-4 h-4 mr-1 fill-white" /> Más Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">Inversión mínima</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl text-gray-400">$</span>
                    <span className="text-5xl font-bold">{plan.price}</span>
                  </div>
                </div>

                <div className="text-center mb-8 p-4 rounded-2xl bg-white/5">
                  <p className="text-sm text-gray-400 mb-1">Rendimiento diario</p>
                  <p className="text-4xl font-bold text-green-400">{plan.rate}%</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-6 text-lg font-semibold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}
                  onClick={() => navigate('/register')}
                >
                  Elegir Plan
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">Testimonios</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Lo que dicen nuestros usuarios
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, i) => (
              <GlassCard key={i} delay={i * 0.1} className="h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Preguntas frecuentes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <GlassCard key={i} delay={i * 0.1}>
                <h3 className="font-bold text-lg mb-3 flex items-start gap-3">
                  <span className="text-green-400">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-gray-400 leading-relaxed pl-7">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-yellow-500/20" />
            <div className="absolute inset-0 backdrop-blur-xl bg-[#0a0f1c]/60" />
            
            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/30 rounded-full blur-[100px]" />
            
            <div className="relative z-10 text-center">
              <Award className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Únete a miles de inversores que ya están ganando con Elite Forex.
                Tu primer depósito está protegido.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/30 text-lg px-8 py-6"
                  onClick={() => navigate('/register')}
                >
                  Crear Cuenta Gratis <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 hover:bg-white/10 text-lg px-8 py-6"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Sin tarjetas de crédito requeridas • Cancela cuando quieras
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-20 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <ChartNoAxesCombined className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Elite Forex</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                Plataforma de trading automatizado líder. Genera ingresos pasivos 
                con la tecnología más avanzada del mercado.
              </p>
              <div className="flex gap-4">
                {[Twitter, Instagram, Youtube, MessageCircle].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500 hover:border-green-500 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Plataforma</h4>
              <ul className="space-y-3 text-gray-400">
                {['Características', 'Planes', 'Cómo funciona', 'FAQ', 'Blog'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                {['Términos de servicio', 'Privacidad', 'Cookies', 'Contacto', 'Ayuda'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Elite Forex. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Español
              </span>
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> SSL Seguro
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={scrollToTop}
        className="fixed bottom-8 left-8 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 z-50 hover:scale-110 transition-transform"
        whileHover={{ y: -2 }}
      >
        <ChevronUp className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
