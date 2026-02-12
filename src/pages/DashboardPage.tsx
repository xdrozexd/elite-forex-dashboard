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
  Bitcoin,
  CheckCircle2,
  Clock3,
  Loader2,
  Wallet,
  ArrowUpRight,
  Users,
  Gift,
  Sparkles,
  Info,
  Award,
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
    description: 'Perfecto para comenzar',
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    price: 200,
    rate: 0.85,
    features: ['Señales avanzadas', 'Retiros 24h', 'Soporte priority', 'Análisis tiempo real'],
    color: 'from-green-500 to-emerald-600',
    icon: Zap,
    popular: true,
    description: 'El más elegido',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    rate: 1.5,
    features: ['Señales VIP', 'Retiros 4h', 'Soporte 24/7', 'Account manager'],
    color: 'from-yellow-500 to-amber-600',
    icon: Award,
    description: 'Máximo rendimiento',
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    console.log('Dashboard: Cargando datos para usuario:', user.uid);

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      setIsLoading(false);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Dashboard: Datos del usuario:', data);
        
        const userHasPlan = data.hasSelectedPlan || false;
        const userPlanActive = data.plan?.isActive || false;
        
        setHasPlan(userHasPlan);
        setPlanActive(userPlanActive);
        
        // Si tiene plan seleccionado pero no activo, verificar depósito pendiente
        if (userHasPlan && !userPlanActive) {
          checkPendingDeposit(user.uid);
        }
      } else {
        console.log('Dashboard: Usuario no tiene documento');
        setHasPlan(false);
        setPlanActive(false);
      }
    }, (error) => {
      console.error('Dashboard: Error:', error);
      setIsLoading(false);
      setHasPlan(false);
      setPlanActive(false);
    });

    // Cargar configuraciones
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
      } else {
        setPendingDeposit(null);
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

      // Crear depósito pendiente
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

      // Actualizar usuario
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
      });

      setHasPlan(true);
      setShowPlanModal(false);
      setSelectedPlan(planId);

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

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    );
  }

  // Modal de selección de plan
  const renderPlanModal = () => {
    if (!showPlanModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1e293b] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Selecciona tu Plan de Inversión</h2>
            <button
              onClick={() => setShowPlanModal(false)}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
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
                <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
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
    );
  };

  // Banner de activación
  const renderActivationBanner = () => {
    if (hasPlan && pendingDeposit) {
      return (
        <GlassCard className="p-4 mb-6 border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock3 className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Depósito en Revisión</h3>
              <p className="text-gray-400">
                Tu depósito de ${pendingDeposit.amount} está siendo verificado por el admin.
              </p>
            </div>
            <Button onClick={() => setSelectedPlan('show_deposit')}>
              Ver Detalles
            </Button>
          </div>
        </GlassCard>
      );
    }

    if (!hasPlan) {
      return (
        <GlassCard className="p-6 mb-6 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">¡Activa tu Plan de Inversión!</h3>
              <p className="text-gray-400 mb-4">
                Selecciona un plan de inversión y comienza a generar ganancias diarias.
                Desde $50 con rendimientos del 0.5% hasta 1.5% diario.
              </p>
              <Button 
                onClick={() => setShowPlanModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Award className="w-4 h-4 mr-2" />
                Activar Mi Plan
              </Button>
            </div>
          </div>
        </GlassCard>
      );
    }

    return null;
  };

  // Pantalla de depósito
  const renderDepositSection = () => {
    if (!selectedPlan || !systemSettings) return null;
    
    const plan = plans.find(p => p.id === pendingDeposit?.planId);
    if (!plan) return null;

    return (
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Realizar Depósito</h2>
          <button
            onClick={() => setSelectedPlan(null)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-4">Datos de Pago</h3>
            
            {systemSettings.bankAccounts?.filter(b => b.isActive).map((bank, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold">{bank.bankName}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>Cuenta: {bank.accountNumber}</p>
                  <p>Titular: {bank.accountHolder}</p>
                  <p>Tipo: {bank.accountType}</p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <Bitcoin className="w-5 h-5 text-orange-400" />
                <span className="font-semibold">USDT (Crypto)</span>
              </div>
              <p className="text-sm text-gray-400 break-all">
                {systemSettings.cryptoWallets?.activeNetwork === 'trc20' 
                  ? systemSettings.cryptoWallets?.usdt_trc20 
                  : systemSettings.cryptoWallets?.usdt_bep20}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Subir Comprobante</h3>
            
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center mb-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">Selecciona una imagen</p>
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
                  <Button variant="outline" className="border-white/20" asChild>
                    <span>Seleccionar archivo</span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <img src={uploadedImage} alt="Comprobante" className="w-full h-48 object-cover rounded-xl" />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20"
                    onClick={() => setUploadedImage(null)}
                  >
                    Cambiar
                  </Button>
                  <Button
                    className="flex-1 bg-green-500"
                    onClick={handleUploadProof}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
                  </Button>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Importante</span>
              </div>
              <p className="text-sm text-gray-400">
                Depósito requerido: ${plan.price}. Una vez verificado, tu plan se activará automáticamente.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  };

  // Dashboard principal
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Banner de activación */}
        {renderActivationBanner()}

        {/* Sección de depósito */}
        {selectedPlan && renderDepositSection()}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

        {/* Información cuando no tiene plan */}
        {!hasPlan && (
          <div className="grid md:grid-cols-3 gap-4">
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">0.5% - 1.5% Diario</h3>
              <p className="text-sm text-gray-400">
                Ganancias diarias según el plan que elijas
              </p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Clock3 className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Retiros Rápidos</h3>
              <p className="text-sm text-gray-400">
                Desde 4 horas hasta 48 horas según tu plan
              </p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">10% Referidos</h3>
              <p className="text-sm text-gray-400">
                Gana comisión por cada referido que invierta
              </p>
            </GlassCard>
          </div>
        )}

        {hasPlan && planActive && (
          <GlassCard className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Plan Activo!</h2>
            <p className="text-gray-400">
              Tu plan está activo y estás generando ganancias diarias.
            </p>
          </GlassCard>
        )}
      </main>

      {/* Modal de planes */}
      {renderPlanModal()}
    </div>
  );
};
