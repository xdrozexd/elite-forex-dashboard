import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, Zap, Award, Home, PieChart, Users, Wallet, ArrowUpRight,
  ArrowDownLeft, Clock, Check, Bell, Settings, History,
  Sparkles, Copy, Gift
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { collection, doc, getDocs, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler);

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'investment', label: 'Mi Inversión', icon: PieChart },
  { id: 'bot', label: 'Operaciones Bot', icon: Zap },
  { id: 'referrals', label: 'Mi Red', icon: Users },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalProfit: 0,
    availableBalance: 0,
    investedAmount: 0,
    dailyProfit: 0,
    referralEarnings: 0,
  });
  const [investment, setInvestment] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nextProfitTime, setNextProfitTime] = useState<string>('');

  // Chart data
  const profitChartData = {
    labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'],
    datasets: [{
      label: 'Crecimiento del Capital',
      data: [500, 506.75, 513.59, 520.52, 527.54, 534.65, 541.85],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const portfolioData = {
    labels: ['Invertido', 'Ganancias', 'Disponible'],
    datasets: [{
      data: [60, 25, 15],
      backgroundColor: ['#22c55e', '#eab308', '#3b82f6'],
      borderWidth: 0,
    }],
  };

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to user data
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats({
          totalBalance: data.balance?.total || 0,
          totalProfit: data.balance?.totalProfit || 0,
          availableBalance: data.balance?.available || 0,
          investedAmount: data.balance?.invested || 0,
          dailyProfit: calculateDailyProfit(data),
          referralEarnings: data.referralEarnings || 0,
        });
        setInvestment(data.plan || null);
      }
    });

    // Load referrals
    loadReferrals();
    // Load transactions
    loadTransactions();
    // Load notifications
    loadNotifications();

    // Countdown to next profit
    const interval = setInterval(() => {
      updateNextProfitTime();
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  const calculateDailyProfit = (userData: any) => {
    if (!userData.plan?.isActive) return 0;
    const rates: { [key: string]: number } = {
      basic: 0.5,
      intermediate: 0.85,
      premium: 1.35,
    };
    const rate = rates[userData.plan.currentPlanId] || 0.5;
    return (userData.plan.investedAmount || 0) * (rate / 100);
  };

  const updateNextProfitTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setNextProfitTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const loadReferrals = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'referrals'), where('referrerId', '==', user.uid));
      const snapshot = await getDocs(q);
      setReferrals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadNotifications = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({ title: 'Código copiado', description: 'Comparte tu código con amigos', variant: 'success' });
    }
  };

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <GlassCard className="p-8 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-green-500/20 border-green-500/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                ¡Hola, {user?.username}! 👋
              </h1>
              <p className="text-gray-400 text-lg mb-4">
                {investment?.isActive 
                  ? 'Tu bot está operando y generando ganancias automáticamente'
                  : 'Activa un plan para comenzar a generar ingresos pasivos'
                }
              </p>
              {investment?.isActive && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Bot Operando - Ganancias cada 24h
                </div>
              )}
            </div>
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
              <Zap className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Balance Total', value: stats.totalBalance, icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/20' },
          { label: 'Ganancias Totales', value: stats.totalProfit, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
          { label: 'Disponible', value: stats.availableBalance, icon: ArrowDownLeft, color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { label: 'Ganancia Hoy', value: stats.dailyProfit, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-6 text-center">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl lg:text-3xl font-bold">${formatCurrency(stat.value)}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Countdown & Next Profit */}
      {investment?.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 text-center">
            <p className="text-gray-400 mb-2">Próxima ganancia en:</p>
            <p className="text-4xl lg:text-5xl font-mono font-bold text-green-400">{nextProfitTime}</p>
            <p className="text-gray-400 mt-2">
              Se acreditará automáticamente: +${formatCurrency(stats.dailyProfit)}
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Investment Status */}
      {investment?.isActive ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                Tu Plan Activo
              </h3>
              <span className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Activo
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-2xl bg-white/5">
                <p className="text-gray-400 mb-1">Capital en Operación</p>
                <p className="text-3xl font-bold text-green-400">${formatCurrency(investment.investedAmount || 0)}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5">
                <p className="text-gray-400 mb-1">Rendimiento Diario</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {investment.currentPlanId === 'basic' ? '0.5%' : 
                   investment.currentPlanId === 'intermediate' ? '0.85%' : '1.35%'}
                </p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5">
                <p className="text-gray-400 mb-1">Ganancia Diaria</p>
                <p className="text-3xl font-bold text-blue-400">+${formatCurrency(stats.dailyProfit)}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-8 text-center bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">¡Activa tu Plan de Inversión!</h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Comienza a generar ingresos pasivos desde $50. Nuestro bot opera automáticamente 
              24/7 generando rendimientos diarios garantizados.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard?tab=plans'}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-lg px-8 py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              Ver Planes de Inversión
            </Button>
          </GlassCard>
        </motion.div>
      )}

      {/* Charts & Activity */}
      {investment?.isActive && (
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Crecimiento del Capital
            </h3>
            <div className="h-64">
              <Line data={profitChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Distribución
            </h3>
            <div className="h-48">
              <Doughnut data={portfolioData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Referral Section */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-1">Programa de Referidos</h3>
            <p className="text-gray-400 mb-4">
              Invita amigos y gana comisiones por sus inversiones y ganancias. 
              Sistema multinivel hasta 5 generaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 p-3 rounded-xl bg-white/5 font-mono text-center sm:text-left">
                {user?.referralCode || 'N/A'}
              </div>
              <Button variant="outline" className="border-white/20" onClick={copyReferralCode}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
              </Button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{referrals.length}</p>
            <p className="text-gray-400">Referidos</p>
            <p className="text-xl font-bold text-yellow-400 mt-2">${formatCurrency(stats.referralEarnings)}</p>
            <p className="text-gray-400 text-sm">Ganado</p>
          </div>
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
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
                    <p className="text-xs text-gray-400">
                      {trans.createdAt?.toDate?.() ? trans.createdAt.toDate().toLocaleDateString() : 'Fecha'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    trans.type === 'deposit' || trans.type === 'profit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trans.type === 'deposit' || trans.type === 'profit' ? '+' : '-'}
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
              <p>No hay transacciones recientes</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );

  // Render Investment Tab
  const renderInvestment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Mi Inversión</h2>
      
      {investment?.isActive ? (
        <>
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
                <Check className="w-4 h-4" />
                Plan Activo
              </div>
              <h3 className="text-3xl font-bold capitalize mb-2">{investment.currentPlanId}</h3>
              <p className="text-gray-400">Inversión Automática con Bot</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 text-center">
                <p className="text-gray-400 mb-2">Capital Invertido</p>
                <p className="text-3xl font-bold text-green-400">${formatCurrency(investment.initialAmount || 0)}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 text-center">
                <p className="text-gray-400 mb-2">Bono de Bienvenida</p>
                <p className="text-3xl font-bold text-yellow-400">+${formatCurrency(investment.bonusAmount || 0)}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 text-center">
                <p className="text-gray-400 mb-2">Capital Operando</p>
                <p className="text-3xl font-bold text-blue-400">${formatCurrency(investment.investedAmount || 0)}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 text-center">
                <p className="text-gray-400 mb-2">Ganancias Acumuladas</p>
                <p className="text-3xl font-bold text-purple-400">${formatCurrency(investment.totalProfitGenerated || 0)}</p>
              </div>
            </div>
          </GlassCard>

          <div className="grid md:grid-cols-2 gap-6">
            <Button className="h-14 bg-gradient-to-r from-green-500 to-emerald-600">
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Agregar Capital
            </Button>
            <Button variant="outline" className="h-14 border-white/20">
              <TrendingUp className="w-5 h-5 mr-2" />
              Upgrade de Plan
            </Button>
          </div>
        </>
      ) : (
        <GlassCard className="p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4">No tienes una inversión activa</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Selecciona un plan de inversión y comienza a generar ganancias automáticas con nuestro bot
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard?tab=plans'}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-lg px-8 py-6"
          >
            Ver Planes Disponibles
          </Button>
        </GlassCard>
      )}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-[#0f172a] border-r border-white/10 flex-col z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Elite Forex</h1>
              <p className="text-xs text-gray-400">Trading Automático</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
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
              {item.id === 'referrals' && referrals.length > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-green-500 text-white text-xs">
                  {referrals.length}
                </span>
              )}
            </button>
          ))}
        </nav>

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
      <header className="lg:hidden sticky top-0 z-40 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Elite Forex</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-72 p-4 lg:p-8 pb-24 lg:pb-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'investment' && renderInvestment()}
        
        {/* Placeholder for other tabs */}
        {activeTab === 'bot' && (
          <div className="text-center py-20">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2">Operaciones del Bot</h2>
            <p className="text-gray-400">Visualización detallada de operaciones en desarrollo</p>
          </div>
        )}
        {activeTab === 'referrals' && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2">Mi Red de Referidos</h2>
            <p className="text-gray-400">Sistema de referidos multinivel en desarrollo</p>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="text-center py-20">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2">Historial Completo</h2>
            <p className="text-gray-400">Historial detallado en desarrollo</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-20">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2">Ajustes</h2>
            <p className="text-gray-400">Configuración en desarrollo</p>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-40">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                activeTab === item.id ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
