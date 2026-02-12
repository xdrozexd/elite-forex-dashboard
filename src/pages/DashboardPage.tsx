import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBalance } from '@/hooks/useBalance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { Sidebar } from '@/components/Sidebar';

import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  Users,
  Settings,
  Bell,
  LogOut,
  TrendingUp,
  DollarSign,
  Copy,
  Clock,
  Target,
  ChevronRight,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock3,
  X,
  Plus,
  Minus,
  Award,
  Gift,
  Lock,
  Mail,
  Smartphone,
  Globe,
  History,
  CreditCard,
  Bitcoin,
  QrCode,
  Save,
  Camera,
  Share2,
  Building2,
  Menu,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'referral';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface Referral {
  id: string;
  name: string;
  date: string;
  earnings: number;
  status: 'active' | 'inactive';
}

// Mock Data
const mockTransactions: Transaction[] = [
  { id: '1', type: 'profit', amount: 12.5, date: '2024-01-15', status: 'completed', description: 'Ganancia diaria' },
  { id: '2', type: 'deposit', amount: 200, date: '2024-01-14', status: 'completed', description: 'Depósito inicial' },
  { id: '3', type: 'withdrawal', amount: 50, date: '2024-01-13', status: 'completed', description: 'Retiro a wallet' },
  { id: '4', type: 'referral', amount: 20, date: '2024-01-12', status: 'completed', description: 'Comisión referido' },
  { id: '5', type: 'profit', amount: 10.2, date: '2024-01-11', status: 'completed', description: 'Ganancia diaria' },
];

const mockReferrals: Referral[] = [
  { id: '1', name: 'Carlos R.', date: '2024-01-10', earnings: 45, status: 'active' },
  { id: '2', name: 'María L.', date: '2024-01-08', earnings: 32, status: 'active' },
  { id: '3', name: 'Juan P.', date: '2024-01-05', earnings: 28, status: 'active' },
  { id: '4', name: 'Ana S.', date: '2023-12-28', earnings: 15, status: 'inactive' },
];

const referralCode = 'ELITE2024';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { balanceData } = useBalance();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1W');
  const [notifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: '¡Copiado!', description: 'Código copiado al portapapeles', variant: 'success' });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawalAmount);
    if (amount < 50) {
      toast({ title: 'Error', description: 'El mínimo de retiro es $50', variant: 'destructive' });
      return;
    }
    if (amount > balanceData.balance) {
      toast({ title: 'Error', description: 'Saldo insuficiente', variant: 'destructive' });
      return;
    }
    toast({ title: '¡Solicitud enviada!', description: `Retiro de $${amount} en proceso`, variant: 'success' });
    setWithdrawalAmount('');
    setShowWithdrawModal(false);
  };

  // Chart Data
  const mainChartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Balance',
        data: [210, 225, 240, 235, 260, 275, 290],
        fill: true,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Ganancias',
        data: [10, 15, 12, 18, 22, 20, 25],
        fill: false,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { 
          color: '#64748b', 
          font: { size: 11 },
          callback: (value: any) => `$${value}`
        },
      },
    },
    interaction: { intersect: false, mode: 'index' as const },
  };

  const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', key: 'overview' },
    { icon: <Wallet className="w-5 h-5" />, label: 'Portfolio', key: 'portfolio' },
    { icon: <ArrowUpRight className="w-5 h-5" />, label: 'Retiros', key: 'withdrawals', badge: 0 },
    { icon: <Users className="w-5 h-5" />, label: 'Referidos', key: 'referrals' },
    { icon: <History className="w-5 h-5" />, label: 'Historial', key: 'history' },
    { icon: <Settings className="w-5 h-5" />, label: 'Configuración', key: 'settings' },
  ];

  // Render Overview Section
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance Total"
          value={balanceData.balance}
          prefix="$"
          change={12.5}
          trend="up"
          icon={<Wallet className="w-6 h-6 text-green-400" />}
          gradient="green"
          delay={0}
        />
        <StatCard
          title="Ganancias Hoy"
          value={balanceData.dailyProfit.toFixed(2)}
          prefix="$"
          change={5.2}
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
          gradient="blue"
          delay={0.1}
        />
        <StatCard
          title="ROI Total"
          value="32.8"
          suffix="%"
          change={8.1}
          trend="up"
          icon={<Target className="w-6 h-6 text-purple-400" />}
          gradient="purple"
          delay={0.2}
        />
        <StatCard
          title="Referidos"
          value="12"
          change={2}
          trend="up"
          icon={<Users className="w-6 h-6 text-orange-400" />}
          gradient="orange"
          delay={0.3}
        />
      </div>

      {/* Main Chart */}
      <GlassCard className="p-6" delay={0.2}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Rendimiento</h3>
            <p className="text-sm text-gray-400">Últimos 7 días</p>
          </div>
          <div className="flex gap-2">
            {['1D', '1W', '1M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg transition-all',
                  selectedTimeframe === tf
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <Line data={mainChartData} options={chartOptions} />
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6 cursor-pointer group" glow="green" delay={0.3}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Retirar fondos</p>
              <p className="text-lg font-semibold group-hover:text-green-400 transition-colors">Solicitar retiro</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 cursor-pointer group" glow="blue" delay={0.4}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Invitar amigos</p>
              <p className="text-lg font-semibold group-hover:text-blue-400 transition-colors">Gana 10%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 cursor-pointer group" glow="purple" delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Próximo pago</p>
              <p className="text-lg font-semibold group-hover:text-purple-400 transition-colors">6:00 PM</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6" delay={0.6}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Actividad Reciente</h3>
          <button className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
            Ver todo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {mockTransactions.slice(0, 3).map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  tx.type === 'profit' && 'bg-green-500/20',
                  tx.type === 'deposit' && 'bg-blue-500/20',
                  tx.type === 'withdrawal' && 'bg-orange-500/20',
                  tx.type === 'referral' && 'bg-purple-500/20'
                )}>
                  {tx.type === 'profit' && <TrendingUp className="w-5 h-5 text-green-400" />}
                  {tx.type === 'deposit' && <Plus className="w-5 h-5 text-blue-400" />}
                  {tx.type === 'withdrawal' && <Minus className="w-5 h-5 text-orange-400" />}
                  {tx.type === 'referral' && <Users className="w-5 h-5 text-purple-400" />}
                </div>
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-gray-400">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-bold',
                  tx.type === 'withdrawal' ? 'text-orange-400' : 'text-green-400'
                )}>
                  {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount}
                </p>
                <Badge variant="outline" className="text-xs">
                  {tx.status === 'completed' ? 'Completado' : tx.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  // Render Portfolio Section
  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mi Portfolio</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Distribution */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Distribución</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Balance Principal', 'Ganancias', 'Bloqueado', 'Disponible'],
                datasets: [{
                  data: [60, 25, 10, 5],
                  backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
                  borderWidth: 0,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', usePointStyle: true }
                  }
                }
              }}
            />
          </div>
        </GlassCard>

        {/* Plan Details */}
        <GlassCard className="p-6" glow="green">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Tu Plan</h3>
            <Badge className="bg-green-500">Activo</Badge>
          </div>
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <p className="text-2xl font-bold">Intermedio</p>
            <p className="text-green-400 text-lg">0.85% / día</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Inversión</span>
              <span className="font-semibold">$200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Ganado</span>
              <span className="font-semibold text-green-400">$45.20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Días activo</span>
              <span className="font-semibold">28</span>
            </div>
          </div>
          <Button className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600">
            Mejorar Plan
          </Button>
        </GlassCard>
      </div>

      {/* Investment History */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Historial de Inversiones</h3>
          <div className="flex gap-2">
            <Input placeholder="Buscar..." className="w-64 bg-white/5" icon={<Search className="w-4 h-4" />} />
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                <th className="pb-3 pl-4">Fecha</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Monto</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 text-right pr-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 pl-4">{tx.date}</td>
                  <td className="py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-lg text-xs font-medium',
                      tx.type === 'profit' && 'bg-green-500/20 text-green-400',
                      tx.type === 'deposit' && 'bg-blue-500/20 text-blue-400',
                      tx.type === 'withdrawal' && 'bg-orange-500/20 text-orange-400',
                      tx.type === 'referral' && 'bg-purple-500/20 text-purple-400'
                    )}>
                      {tx.type === 'profit' ? 'Ganancia' : 
                       tx.type === 'deposit' ? 'Depósito' : 
                       tx.type === 'withdrawal' ? 'Retiro' : 'Referido'}
                    </span>
                  </td>
                  <td className="py-4 font-semibold">${tx.amount}</td>
                  <td className="py-4">
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-4 h-4" /> Completado
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <Button variant="ghost" size="sm">Ver</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );

  // Render Withdrawals Section
  const renderWithdrawals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Retiros</h2>
        <Button onClick={() => setShowWithdrawModal(true)} className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600">
          <ArrowUpRight className="w-4 h-4" /> Solicitar Retiro
        </Button>
      </div>

      {/* Withdrawal Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Transferencia Bancaria', 'Crypto (USDT)', 'PayPal'].map((method, i) => (
          <GlassCard key={i} delay={i * 0.1} className="p-6 cursor-pointer hover:border-green-500/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                {i === 0 && <Building2 className="w-7 h-7 text-blue-400" />}
                {i === 1 && <Bitcoin className="w-7 h-7 text-orange-400" />}
                {i === 2 && <CreditCard className="w-7 h-7 text-blue-600" />}
              </div>
              <div>
                <p className="font-semibold">{method}</p>
                <p className="text-sm text-gray-400">
                  {i === 0 ? '24-48 horas' : i === 1 ? '4-24 horas' : 'Instantáneo'}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Withdrawal History */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-6">Historial de Retiros</h3>
        <div className="space-y-4">
          {[
            { id: 'WD001', date: '2024-01-15', amount: 50, method: 'Crypto', status: 'completed' },
            { id: 'WD002', date: '2024-01-10', amount: 100, method: 'Transferencia', status: 'pending' },
            { id: 'WD003', date: '2024-01-05', amount: 75, method: 'PayPal', status: 'completed' },
          ].map((wd, i) => (
            <motion.div
              key={wd.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  wd.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                )}>
                  {wd.status === 'completed' ? 
                    <CheckCircle2 className="w-5 h-5 text-green-400" /> : 
                    <Clock3 className="w-5 h-5 text-yellow-400" />
                  }
                </div>
                <div>
                  <p className="font-semibold">{wd.id}</p>
                  <p className="text-sm text-gray-400">{wd.date} • {wd.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${wd.amount}</p>
                <Badge variant={wd.status === 'completed' ? 'default' : 'outline'}>
                  {wd.status === 'completed' ? 'Completado' : 'Pendiente'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Solicitar Retiro</h3>
                <button onClick={() => setShowWithdrawModal(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
              
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 mb-6">
                <p className="text-sm text-gray-400">Saldo disponible</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(balanceData.balance)}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monto a retirar</label>
                  <Input
                    type="number"
                    placeholder="Mínimo $50"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="bg-white/5"
                    icon={<DollarSign className="w-4 h-4" />}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Método de retiro</label>
                  <select className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white">
                    <option>Seleccionar método...</option>
                    <option>Transferencia Bancaria</option>
                    <option>Crypto (USDT)</option>
                    <option>PayPal</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-white/5 text-sm text-gray-400">
                  <p className="flex justify-between mb-2">
                    <span>Comisión</span>
                    <span>0%</span>
                  </p>
                  <p className="flex justify-between font-bold text-white">
                    <span>Total a recibir</span>
                    <span>${withdrawalAmount || '0.00'}</span>
                  </p>
                </div>

                <Button 
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600"
                  onClick={handleWithdraw}
                  disabled={!withdrawalAmount || parseFloat(withdrawalAmount) < 50}
                >
                  Confirmar Retiro
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );

  // Render Referrals Section
  const renderReferrals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Programa de Referidos</h2>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Referidos"
          value="12"
          change={3}
          trend="up"
          icon={<Users className="w-6 h-6 text-blue-400" />}
          gradient="blue"
        />
        <StatCard
          title="Ganancias Totales"
          value="245"
          prefix="$"
          change={15}
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-green-400" />}
          gradient="green"
        />
        <StatCard
          title="Tasa de Conversión"
          value="68"
          suffix="%"
          change={5}
          trend="up"
          icon={<Target className="w-6 h-6 text-purple-400" />}
          gradient="purple"
        />
      </div>

      {/* Referral Link */}
      <GlassCard className="p-8 text-center" glow="green">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">¡Invita y Gana!</h3>
          <p className="text-gray-400 mb-6">
            Gana <span className="text-green-400 font-bold">10%</span> de comisión por cada inversión de tus referidos
          </p>
          
          <div className="flex gap-2 max-w-md mx-auto">
            <code className="flex-1 p-4 rounded-xl bg-black/30 font-mono text-lg border border-white/10">
              eliteforex.com/ref/{referralCode}
            </code>
            <Button size="icon" className="h-14 w-14" onClick={copyReferralCode}>
              <Copy className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" /> Compartir
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <QrCode className="w-4 h-4" /> QR Code
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Referrals List */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Tus Referidos</h3>
          <Button variant="outline" size="sm">Ver todos</Button>
        </div>
        <div className="space-y-4">
          {mockReferrals.map((ref, i) => (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 flex items-center justify-center font-bold">
                  {ref.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold">{ref.name}</p>
                  <p className="text-sm text-gray-400">Se unió el {ref.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">+${ref.earnings}</p>
                <Badge variant={ref.status === 'active' ? 'default' : 'secondary'}>
                  {ref.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  // Render Settings Section
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Perfil</h3>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xl font-bold">{user?.username || 'Usuario'}</p>
              <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400">Verificado</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de usuario</label>
              <Input defaultValue={user?.username} className="bg-white/5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input defaultValue={user?.email} className="bg-white/5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Teléfono</label>
              <Input placeholder="+1 234 567 890" className="bg-white/5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">País</label>
              <select className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white">
                <option>Seleccionar país...</option>
                <option>México</option>
                <option>España</option>
                <option>Argentina</option>
                <option>Colombia</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline">Cancelar</Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 gap-2">
              <Save className="w-4 h-4" /> Guardar Cambios
            </Button>
          </div>
        </GlassCard>

        {/* Security Card */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6">Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium">Contraseña</p>
                  <p className="text-sm text-gray-400">Último cambio: hace 30 días</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Cambiar</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium">2FA</p>
                  <p className="text-sm text-gray-400">Autenticación en dos pasos</p>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400">Pendiente</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-medium">Email de recuperación</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Preferences */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-6">Preferencias</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Notificaciones push</p>
                <p className="text-sm text-gray-400">Recibir alertas en tiempo real</p>
              </div>
            </div>
            <div className="w-12 h-6 rounded-full bg-green-500 relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Emails semanales</p>
                <p className="text-sm text-gray-400">Resumen de rendimiento</p>
              </div>
            </div>
            <div className="w-12 h-6 rounded-full bg-white/20 relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Idioma</p>
                <p className="text-sm text-gray-400">Español (Latinoamérica)</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Cambiar</Button>
          </div>
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="p-6 border-red-500/30">
        <h3 className="text-lg font-bold text-red-400 mb-4">Zona de Peligro</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Cerrar sesión</p>
            <p className="text-sm text-gray-400">Salir de tu cuenta en todos los dispositivos</p>
          </div>
          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
          </Button>
        </div>
      </GlassCard>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'portfolio': return renderPortfolio();
      case 'withdrawals': return renderWithdrawals();
      case 'referrals': return renderReferrals();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        activeKey={activeSection}
        onSelect={setActiveSection}
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 px-6 py-4 bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold capitalize">{activeSection}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-400" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                    <p className="font-bold mb-3">Notificaciones</p>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-white/5 text-sm">
                        <p className="font-medium">Ganancia diaria recibida</p>
                        <p className="text-gray-400 text-xs">Hace 2 horas</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 text-sm">
                        <p className="font-medium">Nuevo referido registrado</p>
                        <p className="text-gray-400 text-xs">Hace 5 horas</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{user?.username || 'Usuario'}</p>
                  <p className="text-xs text-gray-400">{user?.plan || 'Básico'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold cursor-pointer">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
