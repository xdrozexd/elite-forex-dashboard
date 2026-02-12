import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, Zap, Check, Upload, Building2, CheckCircle2, Loader2,
  Wallet, ArrowUpRight, Users, Gift, Award, Home, Settings, Bell, Copy,
  History, ArrowDownLeft, TrendingDown, BarChart3, PieChart, Activity,
  Menu, X, MessageCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SystemSettings } from '@/types';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler);

interface DepositData {
  id: string;
  amount: number;
  planId: string;
  type: 'initial' | 'topup';
  paymentMethod: 'bank_transfer_rd' | 'crypto_usdt';
  status: 'pending' | 'confirmed' | 'rejected';
  proofImage: string | null;
  createdAt: Date;
}

interface TradingSignal {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  price: number;
  tp: number;
  sl: number;
  time: string;
  status: 'active' | 'closed';
  result?: 'win' | 'loss';
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'referral';
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  date: Date;
  description: string;
}

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 50,
    rate: 0.5,
    features: ['Señales básicas', 'Retiros 48h', 'Soporte email', '1 señal diaria'],
    color: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-500',
    icon: TrendingUp,
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    price: 200,
    rate: 0.85,
    features: ['Señales avanzadas', 'Retiros 24h', 'Soporte priority', '3 señales diarias', 'Análisis técnico'],
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500',
    icon: Zap,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    rate: 1.5,
    features: ['Señales VIP', 'Retiros 4h', 'Soporte 24/7', 'Señales ilimitadas', 'Account manager', 'Estrategias exclusivas'],
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-500',
    icon: Award,
  },
];

// Mock trading signals
const mockSignals: TradingSignal[] = [
  { id: '1', pair: 'EUR/USD', type: 'buy', price: 1.0845, tp: 1.0890, sl: 1.0820, time: '10:30', status: 'active' },
  { id: '2', pair: 'GBP/USD', type: 'sell', price: 1.2650, tp: 1.2600, sl: 1.2680, time: '09:15', status: 'closed', result: 'win' },
  { id: '3', pair: 'USD/JPY', type: 'buy', price: 149.20, tp: 149.80, sl: 148.90, time: '08:45', status: 'closed', result: 'win' },
  { id: '4', pair: 'XAU/USD', type: 'buy', price: 2035.50, tp: 2045.00, sl: 2028.00, time: '07:30', status: 'closed', result: 'loss' },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);
  const [planActive, setPlanActive] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [pendingDeposit, setPendingDeposit] = useState<DepositData | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signals] = useState<TradingSignal[]>(mockSignals);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chart data
  const profitChartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Ganancias Diarias',
      data: [12.5, 18.3, 15.2, 22.1, 19.8, 25.4, 28.2],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#22c55e',
    }],
  };

  const portfolioData = {
    labels: ['Invertido', 'Ganancias', 'Disponible'],
    datasets: [{
      data: [60, 25, 15],
      backgroundColor: ['#22c55e', '#eab308', '#3b82f6'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      setIsLoading(false);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHasPlan(data.hasSelectedPlan || false);
        setPlanActive(data.plan?.isActive || false);
        setCurrentPlan(data.plan || null);
        
        if (data.hasSelectedPlan && !data.plan?.isActive) {
          checkPendingDeposit(user.uid);
        }
      }
    }, (error) => {
      console.error('Error:', error);
      setIsLoading(false);
    });

    loadTransactions();
    loadSystemSettings();

    return () => unsubscribe();
  }, [user]);

  const checkPendingDeposit = async (userId: string) => {
    try {
      const depositsQuery = query(
        collection(db, 'deposits'),
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(depositsQuery);
      if (!snapshot.empty) {
        const deposit = snapshot.docs[0];
        setPendingDeposit({
          id: deposit.id,
          ...deposit.data(),
          createdAt: deposit.data().createdAt?.toDate(),
        } as DepositData);
      }
    } catch (error) {
      console.error('Error checking deposit:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user?.uid) return;
    
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      const trans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate(),
      })) as Transaction[];
      
      setTransactions(trans);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'system_settings', 'global'));
      if (settingsDoc.exists()) {
        setSystemSettings(settingsDoc.data() as SystemSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user?.uid) return;

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const depositRef = await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        amount: plan.price,
        planId: plan.id,
        type: 'initial',
        paymentMethod: 'bank_transfer_rd',
        status: 'pending',
        proofImage: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        hasSelectedPlan: true,
        selectedPlanId: planId,
        updatedAt: serverTimestamp(),
      });

      setPendingDeposit({
        id: depositRef.id,
        amount: plan.price,
        planId: plan.id,
        type: 'initial',
        paymentMethod: 'bank_transfer_rd',
        status: 'pending',
        proofImage: null,
        createdAt: new Date(),
      } as DepositData);

      setHasPlan(true);
      setShowPlanModal(false);
      setShowDepositModal(true);

      toast({
        title: 'Plan seleccionado',
        description: 'Realiza el depósito para activar tu plan',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo seleccionar el plan',
        variant: 'destructive',
      });
    }
  };

  const handleUploadProof = async () => {
    if (!uploadedImage || !pendingDeposit?.id) return;

    setIsUploading(true);
    try {
      await updateDoc(doc(db, 'deposits', pendingDeposit.id), {
        proofImage: uploadedImage,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Comprobante enviado',
        description: 'Tu depósito está en revisión',
        variant: 'success',
      });
      
      setUploadedImage(null);
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir el comprobante',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-[#0f172a] border-r border-white/10 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Elite Forex</h1>
              <p className="text-xs text-gray-400">Trading Profesional</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'portfolio', label: 'Mi Portafolio', icon: PieChart },
            { id: 'signals', label: 'Señales', icon: Activity },
            { id: 'transactions', label: 'Transacciones', icon: History },
            { id: 'referrals', label: 'Referidos', icon: Users },
            { id: 'support', label: 'Soporte', icon: MessageCircle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Elite Forex</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-[#0a0f1c] pt-16"
        >
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'portfolio', label: 'Mi Portafolio', icon: PieChart },
              { id: 'signals', label: 'Señales', icon: Activity },
              { id: 'transactions', label: 'Transacciones', icon: History },
              { id: 'referrals', label: 'Referidos', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 p-4 lg:p-8 pb-24 lg:pb-8">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              ¡Hola, {user?.username}! 👋
            </h1>
            <p className="text-gray-400">
              {planActive ? 'Tu inversión está generando ganancias' : 'Activa un plan para comenzar'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Retirar
            </Button>
          </div>
        </div>

        {/* Activation Banner */}
        {!hasPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-8 bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-yellow-500/20 border-yellow-500/30">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl font-bold mb-2">¡Activa tu Plan de Inversión!</h2>
                  <p className="text-gray-400 mb-4 max-w-2xl">
                    Comienza a generar ganancias diarias con nuestras señales profesionales. 
                    Desde $50 con rendimientos del 0.5% hasta 1.5% diario.
                  </p>
                  <Button 
                    onClick={() => setShowPlanModal(true)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-lg px-8 py-6"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Activar Mi Plan Ahora
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Balance Total', value: user?.balance?.total || 0, icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/20' },
            { label: 'Ganancias', value: user?.balance?.totalProfit || 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/20' },
            { label: 'Disponible', value: user?.balance?.available || 0, icon: ArrowDownLeft, color: 'text-purple-400', bg: 'bg-purple-500/20' },
            { label: 'Referidos', value: 0, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold">${formatCurrency(stat.value)}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        {planActive && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <GlassCard className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Rendimiento Diario
                </h3>
                <span className="text-sm text-gray-400">Últimos 7 días</span>
              </div>
              <div className="h-64">
                <Line data={profitChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                Distribución
              </h3>
              <div className="h-48">
                <Doughnut data={portfolioData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Active Plan & Signals */}
        {planActive && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Active Plan Card */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Tu Plan Activo</h3>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Activo
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-400">Plan</span>
                  <span className="font-semibold capitalize text-lg">
                    {currentPlan?.currentPlanId}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-400">Monto Invertido</span>
                  <span className="font-semibold text-green-400 text-lg">
                    ${formatCurrency(currentPlan?.investedAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-400">Ganancia Diaria</span>
                  <span className="font-semibold text-blue-400 text-lg">
                    ${formatCurrency((currentPlan?.investedAmount || 0) * 
                      (plans.find(p => p.id === currentPlan?.currentPlanId)?.rate || 0.5) / 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-gray-400">Tasa de Retorno</span>
                  <span className="font-semibold text-yellow-400 text-lg">
                    {plans.find(p => p.id === currentPlan?.currentPlanId)?.rate || 0.5}% diario
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Trading Signals */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Señales de Trading
                </h3>
                <span className="text-sm text-gray-400">Hoy</span>
              </div>
              <div className="space-y-3">
                {signals.slice(0, 4).map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        signal.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {signal.type === 'buy' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{signal.pair}</p>
                        <p className="text-xs text-gray-400">{signal.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        signal.status === 'active' ? 'text-yellow-400' :
                        signal.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {signal.status === 'active' ? 'Activa' :
                         signal.result === 'win' ? 'Ganada' : 'Perdida'}
                      </p>
                      <p className="text-xs text-gray-400">{signal.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Plans Comparison */}
        {!hasPlan && (
          <GlassCard className="p-6 mb-8">
            <h3 className="font-bold text-xl mb-6 text-center">Compara Nuestros Planes</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-b from-green-500/20 to-emerald-500/10 border-green-500/50' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold mb-4">
                      MÁS POPULAR
                    </span>
                  )}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-1">{plan.name}</h4>
                  <p className="text-3xl font-bold text-green-400 mb-1">${plan.price}</p>
                  <p className="text-green-400 font-semibold mb-4">{plan.rate}% ganancia diaria</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    Seleccionar Plan
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recent Transactions */}
        <GlassCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Transacciones Recientes
            </h3>
            <Button variant="outline" size="sm" className="border-white/20">
              Ver Todo
            </Button>
          </div>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((trans) => (
                <div key={trans.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trans.type === 'deposit' ? 'bg-green-500/20' :
                      trans.type === 'withdrawal' ? 'bg-red-500/20' :
                      trans.type === 'profit' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                    }`}>
                      {trans.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5 text-green-400" /> :
                       trans.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                       trans.type === 'profit' ? <TrendingUp className="w-5 h-5 text-blue-400" /> :
                       <Gift className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{trans.type}</p>
                      <p className="text-xs text-gray-400">{formatDate(trans.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      trans.type === 'deposit' || trans.type === 'profit' || trans.type === 'referral'
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trans.type === 'deposit' || trans.type === 'profit' || trans.type === 'referral' ? '+' : '-'}
                      ${formatCurrency(trans.amount)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      trans.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      trans.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {trans.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay transacciones aún</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Referral Section */}
        <GlassCard className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-bold text-xl mb-2">Programa de Referidos</h3>
              <p className="text-gray-400 mb-4">
                Invita amigos y gana el <span className="text-green-400 font-bold">10%</span> de su primera inversión
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 p-3 rounded-xl bg-white/5 font-mono text-sm flex items-center justify-between">
                  <span>{user?.referralCode || 'N/A'}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user?.referralCode || '');
                      toast({ title: 'Copiado', variant: 'success' });
                    }}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Users className="w-4 h-4 mr-2" />
                  Invitar Amigos
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </main>

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Selecciona tu Plan</h2>
                <p className="text-gray-400">Elige el plan que mejor se adapte a tus objetivos</p>
              </div>
              <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-2xl border transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-b from-green-500/20 to-emerald-500/10 border-green-500 scale-105' 
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold">
                      RECOMENDADO
                    </span>
                  )}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 mx-auto`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl text-center mb-1">{plan.name}</h3>
                  <p className="text-4xl font-bold text-green-400 text-center mb-1">${plan.price}</p>
                  <p className="text-green-400 font-semibold text-center mb-6">{plan.rate}% diario</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                        <Check className="w-5 h-5 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-6 text-lg ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {plan.popular ? 'Elegir Plan' : 'Seleccionar'}
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && pendingDeposit && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Completar Depósito</h2>
              <button onClick={() => setShowDepositModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="font-semibold mb-2">Monto a depositar: <span className="text-2xl text-yellow-400">${pendingDeposit.amount}</span></p>
                <p className="text-sm text-gray-400">Realiza la transferencia y sube el comprobante</p>
              </div>
              {systemSettings?.bankAccounts?.filter(b => b.isActive).map((bank, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">{bank.bankName}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Cuenta: <span className="text-white">{bank.accountNumber}</span></p>
                    <p>Titular: <span className="text-white">{bank.accountHolder}</span></p>
                    <p>Tipo: <span className="text-white">{bank.accountType}</span></p>
                  </div>
                </div>
              ))}
              <div>
                <p className="font-semibold mb-3">Subir Comprobante</p>
                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setUploadedImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="proof-upload"
                    />
                    <label htmlFor="proof-upload">
                      <Button variant="outline" className="border-white/20">Seleccionar Imagen</Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <img src={uploadedImage} alt="Comprobante" className="w-full h-48 object-cover rounded-xl" />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 border-white/20" onClick={() => setUploadedImage(null)}>
                        Cambiar
                      </Button>
                      <Button className="flex-1 bg-green-500" onClick={handleUploadProof} disabled={isUploading}>
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Comprobante'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-40">
        <div className="flex justify-around">
          {[
            { id: 'dashboard', icon: Home, label: 'Inicio' },
            { id: 'portfolio', icon: PieChart, label: 'Portafolio' },
            { id: 'signals', icon: Activity, label: 'Señales' },
            { id: 'settings', icon: Settings, label: 'Ajustes' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                activeTab === item.id ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
