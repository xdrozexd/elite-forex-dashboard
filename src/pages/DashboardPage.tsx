import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Zap,
  Check,
  Upload,
  Building2,
  Clock3,
  Loader2,
  Wallet,
  ArrowUpRight,
  Users,
  Gift,
  Sparkles,
  Award,
  Home,
  Settings,
  Bell,
  Copy,
  History,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SystemSettings } from '@/types';

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
    features: ['Señales avanzadas', 'Retiros 24h', 'Soporte priority'],
    color: 'from-green-500 to-emerald-600',
    icon: Zap,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    rate: 1.5,
    features: ['Señales VIP', 'Retiros 4h', 'Soporte 24/7'],
    color: 'from-yellow-500 to-amber-600',
    icon: Award,
  },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);
  const [planActive, setPlanActive] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<DepositData | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        
        if (data.hasSelectedPlan && !data.plan?.isActive) {
          checkPendingDeposit(user.uid);
        }
      }
    }, (error) => {
      console.error('Error:', error);
      setIsLoading(false);
    });

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
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="font-bold text-lg">Mi Dashboard</h1>
            <p className="text-sm text-gray-400">Hola, {user?.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Welcome Banner */}
        <GlassCard className="p-6 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">¡Hola, {user?.username}! 👋</h1>
              <p className="text-gray-400">
                {planActive 
                  ? 'Tu inversión está generando ganancias'
                  : hasPlan 
                    ? 'Completa tu depósito para activar el plan'
                    : 'Activa un plan para comenzar a invertir'
                }
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </GlassCard>

        {/* Activation Banner */}
        {!hasPlan && (
          <GlassCard className="p-6 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Award className="w-7 h-7 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">¡Activa tu Plan de Inversión!</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Comienza a generar ganancias diarias desde $50
                </p>
                <Button onClick={() => setShowPlanModal(true)} className="bg-gradient-to-r from-yellow-500 to-orange-500">
                  <Zap className="w-4 h-4 mr-2" />
                  Activar Ahora
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Pending Deposit Banner */}
        {hasPlan && pendingDeposit && (
          <GlassCard className="p-6 border-yellow-500/30 bg-yellow-500/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Clock3 className="w-7 h-7 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Depósito en Revisión</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Tu depósito de ${pendingDeposit.amount} está siendo verificado
                </p>
                <Button onClick={() => setShowDepositModal(true)} variant="outline" className="border-yellow-500/50">
                  Ver Estado
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center">
            <Wallet className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">${formatCurrency(user?.balance?.total || 0)}</p>
            <p className="text-xs text-gray-400">Balance Total</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">${formatCurrency(user?.balance?.totalProfit || 0)}</p>
            <p className="text-xs text-gray-400">Ganancias</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <ArrowUpRight className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">${formatCurrency(user?.balance?.available || 0)}</p>
            <p className="text-xs text-gray-400">Disponible</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Users className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-gray-400">Referidos</p>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        {planActive && (
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-14 bg-gradient-to-r from-green-500 to-emerald-600">
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Retirar
            </Button>
            <Button variant="outline" className="h-14 border-white/20">
              <Gift className="w-5 h-5 mr-2" />
              Invitar
            </Button>
          </div>
        )}

        {/* Investment Plans Info */}
        {!hasPlan && (
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Planes de Inversión</h3>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <plan.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm text-gray-400">{plan.rate}% diario</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-400">${plan.price}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Active Plan Info */}
        {planActive && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Tu Plan Activo</h3>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                Activo
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan</span>
                <span className="font-semibold capitalize">{user?.plan?.currentPlanId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Invertido</span>
                <span className="font-semibold text-green-400">${formatCurrency(user?.plan?.investedAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ganancia Diaria</span>
                <span className="font-semibold text-blue-400">
                  ${formatCurrency((user?.plan?.investedAmount || 0) * (plans.find(p => p.id === user?.plan?.currentPlanId)?.rate || 0.5) / 100)}
                </span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Referral Section */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-lg">Programa de Referidos</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Invita amigos y gana el 10% de su primera inversión
          </p>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-xl bg-white/5 font-mono text-sm">
              {user?.referralCode || 'N/A'}
            </div>
            <Button variant="outline" className="border-white/20" onClick={() => {
              navigator.clipboard.writeText(user?.referralCode || '');
              toast({ title: 'Código copiado', variant: 'success' });
            }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>
      </main>

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Selecciona tu Plan</h2>
              <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-lg hover:bg-white/10">✕</button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 cursor-pointer transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-3xl font-bold text-green-400 mb-1">${plan.price}</p>
                  <p className="text-green-400 font-semibold mb-4">{plan.rate}% diario</p>
                  <div className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600">
                    Seleccionar
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
              <button onClick={() => setShowDepositModal(false)} className="p-2 rounded-lg hover:bg-white/10">✕</button>
            </div>

            <div className="space-y-6">
              {/* Payment Info */}
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="font-semibold mb-2">Monto a depositar: ${pendingDeposit.amount}</p>
                <p className="text-sm text-gray-400">Realiza la transferencia y sube el comprobante</p>
              </div>

              {/* Bank Accounts */}
              {systemSettings?.bankAccounts?.filter(b => b.isActive).map((bank, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">{bank.bankName}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Cuenta: {bank.accountNumber}</p>
                    <p>Titular: {bank.accountHolder}</p>
                  </div>
                </div>
              ))}

              {/* Upload Proof */}
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
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2">
        <div className="max-w-6xl mx-auto flex justify-around">
          <button className="flex flex-col items-center gap-1 p-2 text-green-400">
            <Home className="w-6 h-6" />
            <span className="text-xs">Inicio</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors">
            <History className="w-6 h-6" />
            <span className="text-xs">Historial</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors">
            <Users className="w-6 h-6" />
            <span className="text-xs">Referidos</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Ajustes</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
