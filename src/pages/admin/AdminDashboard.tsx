import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard, Users, DollarSign, ArrowUpRight, 
  Settings, LogOut, Bell, TrendingUp, Wallet, 
  CheckCircle, XCircle, Clock, Search, X, 
  Download, Menu, Play, Building2, Bitcoin
} from 'lucide-react';
import { AdminControls } from './AdminControls';
import { db } from '@/firebase/config';
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, 
  addDoc, serverTimestamp, getDoc, getDocs, increment, limit
} from 'firebase/firestore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  ArcElement, Title, Tooltip, Legend, Filler
);

interface UserData {
  uid: string;
  username: string;
  email: string;
  role: string;
  hasSelectedPlan: boolean;
  plan: {
    currentPlanId: string | null;
    investedAmount: number;
    isActive: boolean;
  };
  balance: {
    total: number;
    available: number;
    invested: number;
    totalProfit: number;
  };
  referralCode: string;
  createdAt: Date;
  isActive: boolean;
  totalReferrals: number;
  referralEarnings: number;
}

interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  planId: string;
  type: 'initial' | 'topup';
  paymentMethod: string;
  proofImage: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: Date;
}

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  finalAmount: number;
  penaltyAmount: number;
  method: string;
  accountInfo: any;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
}

// Chat functionality removed for now - will be added in future update
// interface ChatRoom {
//   id: string;
//   userId: string;
//   userName: string;
//   userEmail: string;
//   lastMessage: string;
//   lastMessageAt: Date;
//   unreadCount: number;
//   status: 'active' | 'closed';
// }
// 
// interface ChatMessage {
//   id: string;
//   userId: string;
//   userName: string;
//   userRole: 'user' | 'admin';
//   message: string;
//   type: 'text' | 'image';
//   imageUrl?: string;
//   timestamp: Date;
//   read: boolean;
// }

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvested: 0,
    totalProfitPaid: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    activeInvestments: 0,
    todayProfit: 0,
    newUsersToday: 0,
  });

  // Data states
  const [users, setUsers] = useState<UserData[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Filter states
  const [userFilter, setUserFilter] = useState('');
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all');

  // Chart data
  const [growthChartData] = useState({
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Nuevas Inversiones',
      data: [12500, 19000, 15000, 25000, 22000, 30000, 35000],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  });

  const [plansChartData] = useState({
    labels: ['Starter', 'Pro', 'Elite', 'Premium'],
    datasets: [{
      data: [30, 45, 15, 10],
      backgroundColor: ['#64748b', '#22c55e', '#eab308', '#f59e0b'],
      borderWidth: 0,
    }],
  });

  // Subscribe to data
  useEffect(() => {
    if (!user?.uid) return;

    // Users
    const usersUnsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as UserData[];
        
        setUsers(usersData);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = usersData.filter(u => u.createdAt >= today).length;
        const totalInvested = usersData.reduce((acc, u) => acc + (u.balance?.invested || 0), 0);
        const totalProfitPaid = usersData.reduce((acc, u) => acc + (u.balance?.totalProfit || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          newUsersToday,
          totalInvested,
          totalProfitPaid,
        }));
      }
    );

    // Deposits
    const depositsUnsubscribe = onSnapshot(
      query(collection(db, 'deposits'), orderBy('createdAt', 'desc')),
      async (snapshot) => {
        const depositsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            const userData = userDoc.data();
            
            return {
              id: docSnapshot.id,
              ...data,
              userName: userData?.username || 'Unknown',
              userEmail: userData?.email || 'Unknown',
              createdAt: data.createdAt?.toDate(),
            } as Deposit;
          })
        );
        setDeposits(depositsData);
        
        const pendingDeposits = depositsData.filter(d => d.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingDeposits }));
      }
    );

    // Withdrawals
    const withdrawalsUnsubscribe = onSnapshot(
      query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')),
      async (snapshot) => {
        const withdrawalsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            const userData = userDoc.data();
            
            return {
              id: docSnapshot.id,
              ...data,
              userName: userData?.username || 'Unknown',
              userEmail: userData?.email || 'Unknown',
              createdAt: data.createdAt?.toDate(),
            } as Withdrawal;
          })
        );
        setWithdrawals(withdrawalsData);
        
        const pendingWithdrawals = withdrawalsData.filter(w => w.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingWithdrawals }));
      }
    );

    return () => {
      usersUnsubscribe();
      depositsUnsubscribe();
      withdrawalsUnsubscribe();
    };
  }, [user]);

  const handleApproveDeposit = async (depositId: string, userId: string, amount: number, planId: string) => {
    try {
      // Update deposit
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'confirmed',
        approvedAt: serverTimestamp(),
        approvedBy: user?.uid,
      });

      // Get plan rates
      const planRates: { [key: string]: number } = {
        basic: 0.5,
        intermediate: 0.85,
        premium: 1.35,
      };

      // Calculate bonus
      let bonusPercent = 0;
      if (amount >= 1000) bonusPercent = 0.20;
      else if (amount >= 500) bonusPercent = 0.15;
      else if (amount >= 200) bonusPercent = 0.125;
      else bonusPercent = 0.10;

      const bonusAmount = amount * bonusPercent;
      const totalAmount = amount + bonusAmount;

      // Create investment
      await addDoc(collection(db, 'investments'), {
        userId,
        plan: planId,
        amount: totalAmount,
        initialAmount: amount,
        bonusAmount: bonusAmount,
        dailyRate: planRates[planId] || 0.5,
        totalProfitGenerated: 0,
        startDate: serverTimestamp(),
        isActive: true,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      // Update user
      await updateDoc(doc(db, 'users', userId), {
        'plan.currentPlanId': planId,
        'plan.investedAmount': totalAmount,
        'plan.initialAmount': amount,
        'plan.bonusAmount': bonusAmount,
        'plan.isActive': true,
        'balance.total': totalAmount,
        'balance.invested': totalAmount,
        hasSelectedPlan: true,
        updatedAt: serverTimestamp(),
      });

      // Create transaction
      await addDoc(collection(db, 'transactions'), {
        userId,
        type: 'deposit',
        amount: amount,
        bonusAmount: bonusAmount,
        totalAmount: totalAmount,
        status: 'completed',
        description: `Depósito aprobado + Bono ${(bonusPercent * 100).toFixed(0)}%`,
        createdAt: serverTimestamp(),
      });

      // Process referral commission
      await processReferralCommission(userId, amount);

      toast({ title: 'Depósito aprobado exitosamente', variant: 'success' });
    } catch (error) {
      console.error('Error approving deposit:', error);
      toast({ title: 'Error al aprobar depósito', variant: 'destructive' });
    }
  };

  const processReferralCommission = async (userId: string, depositAmount: number) => {
    try {
      const referralDoc = await getDocs(
        query(collection(db, 'referrals'), where('referredId', '==', userId), limit(1))
      );

      if (referralDoc.empty) return;

      const referral = referralDoc.docs[0].data();
      const referrerId = referral.referrerId;

      // Check if first deposit commission already paid
      const existingCommission = await getDocs(
        query(
          collection(db, 'referral_commissions'),
          where('referredId', '==', userId),
          where('type', '==', 'first_deposit')
        )
      );

      if (!existingCommission.empty) return;

      // Pay 10% commission
      const commissionAmount = depositAmount * 0.10;

      await addDoc(collection(db, 'referral_commissions'), {
        referrerId,
        referredId: userId,
        level: 1,
        type: 'first_deposit',
        depositAmount,
        commissionAmount,
        commissionRate: 0.10,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', referrerId), {
        'balance.total': increment(commissionAmount),
        'balance.available': increment(commissionAmount),
        referralEarnings: increment(commissionAmount),
        updatedAt: serverTimestamp(),
      });

      // Notification
      await addDoc(collection(db, 'notifications'), {
        userId: referrerId,
        title: '¡Nueva Comisión!',
        message: `Has ganado $${commissionAmount.toFixed(2)} por el depósito de tu referido`,
        type: 'referral',
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error processing referral commission:', error);
    }
  };

  const handleRejectDeposit = async (depositId: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.uid,
      });
      toast({ title: 'Depósito rechazado', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error al rechazar', variant: 'destructive' });
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string, transactionHash?: string) => {
    try {
      const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
      const withdrawalDoc = await getDoc(withdrawalRef);
      const withdrawalData = withdrawalDoc.data();

      await updateDoc(withdrawalRef, {
        status: 'completed',
        processedAt: serverTimestamp(),
        processedBy: user?.uid,
        transactionHash,
      });

      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        userId: withdrawalData?.userId,
        type: 'withdrawal',
        amount: withdrawalData?.amount,
        finalAmount: withdrawalData?.finalAmount,
        penaltyAmount: withdrawalData?.penaltyAmount,
        status: 'completed',
        description: `Retiro procesado${transactionHash ? ` - TX: ${transactionHash}` : ''}`,
        createdAt: serverTimestamp(),
      });

      toast({ title: 'Retiro procesado exitosamente', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error al procesar retiro', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.email.toLowerCase().includes(userFilter.toLowerCase())
  );

  const filteredDeposits = deposits.filter(d => 
    depositFilter === 'all' || d.status === depositFilter
  );

  const filteredWithdrawals = withdrawals.filter(w => 
    withdrawalFilter === 'all' || w.status === withdrawalFilter
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users, color: 'blue', trend: `+${stats.newUsersToday} hoy` },
          { label: 'Total Invertido', value: `$${formatCurrency(stats.totalInvested)}`, icon: Wallet, color: 'green' },
          { label: 'Ganancias Pagadas', value: `$${formatCurrency(stats.totalProfitPaid)}`, icon: TrendingUp, color: 'purple' },
          { label: 'Depósitos Pendientes', value: stats.pendingDeposits, icon: Clock, color: 'yellow', alert: stats.pendingDeposits > 0 },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.alert ? 'text-red-400' : ''}`}>
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <p className="text-xs text-green-400 mt-1">{stat.trend}</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-bold mb-4">Inversiones (Últimos 7 días)</h3>
          <div className="h-64">
            <Line data={growthChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-bold mb-4">Distribución de Planes</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={plansChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar usuario..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="pl-10 w-64 bg-white/5 border-white/10"
            />
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-medium text-gray-400">Usuario</th>
                <th className="text-left p-4 font-medium text-gray-400">Plan</th>
                <th className="text-left p-4 font-medium text-gray-400">Invertido</th>
                <th className="text-left p-4 font-medium text-gray-400">Ganancias</th>
                <th className="text-left p-4 font-medium text-gray-400">Referidos</th>
                <th className="text-left p-4 font-medium text-gray-400">Registro</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userData) => (
                <tr key={userData.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold">
                        {userData.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{userData.username}</p>
                        <p className="text-sm text-gray-400">{userData.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {userData.plan?.isActive ? (
                      <Badge className="bg-green-500/20 text-green-400 capitalize">
                        {userData.plan.currentPlanId}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sin plan</Badge>
                    )}
                  </td>
                  <td className="p-4">${formatCurrency(userData.balance?.invested || 0)}</td>
                  <td className="p-4 text-green-400">${formatCurrency(userData.balance?.totalProfit || 0)}</td>
                  <td className="p-4">{userData.totalReferrals || 0}</td>
                  <td className="p-4 text-gray-400">{formatDate(userData.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );

  const renderDeposits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Depósitos</h2>
        <select
          value={depositFilter}
          onChange={(e) => setDepositFilter(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmados</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredDeposits.map((deposit) => (
          <GlassCard key={deposit.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  deposit.status === 'pending' ? 'bg-yellow-500/20' :
                  deposit.status === 'confirmed' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {deposit.paymentMethod === 'bank_transfer_rd' ? (
                    <Building2 className={`w-6 h-6 ${
                      deposit.status === 'pending' ? 'text-yellow-400' :
                      deposit.status === 'confirmed' ? 'text-green-400' : 'text-red-400'
                    }`} />
                  ) : (
                    <Bitcoin className={`w-6 h-6 ${
                      deposit.status === 'pending' ? 'text-yellow-400' :
                      deposit.status === 'confirmed' ? 'text-green-400' : 'text-red-400'
                    }`} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{deposit.userName}</p>
                  <p className="text-sm text-gray-400">{deposit.userEmail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{deposit.type}</Badge>
                    <span className="text-sm text-gray-400">• {formatDate(deposit.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">${formatCurrency(deposit.amount)}</p>
                <Badge className="mt-1" variant={
                  deposit.status === 'pending' ? 'outline' :
                  deposit.status === 'confirmed' ? 'default' : 'destructive'
                }>
                  {deposit.status}
                </Badge>
              </div>
            </div>

            {deposit.proofImage && (
              <div className="mt-4 p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400 mb-2">Comprobante:</p>
                <img src={deposit.proofImage} alt="Comprobante" className="max-h-48 rounded-lg" />
              </div>
            )}

            {deposit.status === 'pending' && (
              <div className="flex gap-3 mt-4">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => handleApproveDeposit(deposit.id, deposit.userId, deposit.amount, deposit.planId)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleRejectDeposit(deposit.id, 'Comprobante inválido')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderWithdrawals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Retiros</h2>
        <select
          value={withdrawalFilter}
          onChange={(e) => setWithdrawalFilter(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="processing">Procesando</option>
          <option value="completed">Completados</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredWithdrawals.map((withdrawal) => (
          <GlassCard key={withdrawal.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  withdrawal.status === 'pending' ? 'bg-yellow-500/20' :
                  withdrawal.status === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <ArrowUpRight className={`w-6 h-6 ${
                    withdrawal.status === 'pending' ? 'text-yellow-400' :
                    withdrawal.status === 'completed' ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <p className="font-bold text-lg">{withdrawal.userName}</p>
                  <p className="text-sm text-gray-400">{withdrawal.userEmail}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-400">
                      Método: {withdrawal.method === 'bank_transfer_rd' ? 'Transferencia' : 'Crypto'}
                    </p>
                    {withdrawal.penaltyAmount > 0 && (
                      <p className="text-red-400">
                        Penalización (retiro anticipado): ${formatCurrency(withdrawal.penaltyAmount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-400">${formatCurrency(withdrawal.amount)}</p>
                <p className="text-sm text-gray-400">Neto: ${formatCurrency(withdrawal.finalAmount || withdrawal.amount)}</p>
                <Badge className="mt-1" variant={
                  withdrawal.status === 'pending' ? 'outline' :
                  withdrawal.status === 'completed' ? 'default' : 'destructive'
                }>
                  {withdrawal.status}
                </Badge>
              </div>
            </div>

            {withdrawal.status === 'pending' && (
              <div className="flex gap-3 mt-4">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => handleProcessWithdrawal(withdrawal.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Procesar
                </Button>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'deposits', label: 'Depósitos', icon: DollarSign, badge: stats.pendingDeposits },
    { id: 'withdrawals', label: 'Retiros', icon: ArrowUpRight, badge: stats.pendingWithdrawals },
    { id: 'controls', label: 'Controles', icon: Play },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#0f172a] border-r border-white/10 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="bg-red-500 text-white">{item.badge}</Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 px-6 py-4 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5" />
                {(stats.pendingDeposits + stats.pendingWithdrawals) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {stats.pendingDeposits + stats.pendingWithdrawals}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                {sidebarOpen && (
                  <div className="hidden md:block">
                    <p className="font-medium">{user?.username || 'Admin'}</p>
                    <p className="text-xs text-gray-400">Administrador</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'deposits' && renderDeposits()}
              {activeTab === 'withdrawals' && renderWithdrawals()}
              {activeTab === 'controls' && <AdminControls />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
