import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isAdmin, users, pendingDeposits, pendingWithdrawals, stats, isLoading, approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal } = useAdmin();
  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'withdrawals'>('overview');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-400 mb-6">No tienes permisos de administrador.</p>
          <Button onClick={() => navigate('/dashboard')}>Volver al Dashboard</Button>
        </GlassCard>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">Panel Admin</h1>
          </div>
          <button onClick={handleLogout} className="p-2 text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-white/5">
        {[
          { key: 'overview', label: 'Resumen', icon: TrendingUp },
          { key: 'deposits', label: `Depósitos (${pendingDeposits.length})`, icon: DollarSign },
          { key: 'withdrawals', label: `Retiros (${pendingWithdrawals.length})`, icon: Clock },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="p-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <GlassCard className="p-4 text-center">
                    <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-400">Usuarios</p>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</p>
                    <p className="text-xs text-gray-400">Invertido</p>
                  </GlassCard>
                </div>

                {/* Recent Users */}
                <div>
                  <h3 className="font-bold mb-3">Usuarios Recientes</h3>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.uid} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatCurrency(user.balance?.invested || 0)}</p>
                          <p className="text-xs text-green-400 capitalize">{user.plan?.currentPlanId || 'basic'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deposits' && (
              <div className="space-y-3">
                {pendingDeposits.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No hay depósitos pendientes</div>
                ) : (
                  pendingDeposits.map((deposit) => (
                    <GlassCard key={deposit.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold">{deposit.userName}</p>
                          <p className="text-xs text-gray-400">{deposit.userEmail}</p>
                        </div>
                        <p className="text-xl font-bold text-green-400">{formatCurrency(deposit.amount)}</p>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {deposit.type === 'initial' ? 'Depósito Inicial' : 'Recarga'} • {deposit.paymentMethod === 'bank_transfer_rd' ? 'Transferencia RD' : 'Crypto USDT'}
                      </p>
                      {deposit.proofImage && (
                        <img src={deposit.proofImage} alt="Comprobante" className="w-full h-32 object-cover rounded-lg mb-3" />
                      )}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => approveDeposit(deposit.id, deposit.userId, deposit.amount)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Aprobar
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400"
                          onClick={() => rejectDeposit(deposit.id, 'Comprobante inválido')}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Rechazar
                        </Button>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="space-y-3">
                {pendingWithdrawals.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No hay retiros pendientes</div>
                ) : (
                  pendingWithdrawals.map((withdrawal) => (
                    <GlassCard key={withdrawal.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold">{withdrawal.userName}</p>
                          <p className="text-xs text-gray-400">{withdrawal.userEmail}</p>
                        </div>
                        <p className="text-xl font-bold text-orange-400">{formatCurrency(withdrawal.amount)}</p>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        <p>Método: {withdrawal.method === 'bank_transfer_rd' ? 'Transferencia RD' : 'Crypto USDT'}</p>
                        {withdrawal.bankDetails && (
                          <p>Banco: {withdrawal.bankDetails.bankName}</p>
                        )}
                        {withdrawal.cryptoDetails && (
                          <p>Red: {withdrawal.cryptoDetails.network}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => approveWithdrawal(withdrawal.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Procesar
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400"
                          onClick={() => rejectWithdrawal(withdrawal.id, 'Fondos insuficientes')}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Rechazar
                        </Button>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
