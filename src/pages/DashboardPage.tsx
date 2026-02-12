import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/GlassCard';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Zap,
  Clock,
  Check,
  Upload,
  MessageCircle,
  Send,
  Building2,
  Bitcoin,
  CheckCircle2,
  Clock3,
  Loader2,
} from 'lucide-react';

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
    icon: Clock,
    description: 'Máximo rendimiento',
  },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userStatus, setUserStatus] = useState<'loading' | 'no_plan' | 'pending_deposit' | 'active'>('loading');
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [pendingDeposit, setPendingDeposit] = useState<DepositData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Cargar estado del usuario
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        
        if (!data.hasSelectedPlan) {
          setUserStatus('no_plan');
        } else if (data.plan?.currentPlanId && data.plan.isActive) {
          setUserStatus('active');
        } else {
          // Tiene plan seleccionado pero no activo - revisar si hay depósito pendiente
          checkPendingDeposit(user.uid);
        }
      }
    });

    // Cargar configuraciones del sistema
    loadSystemSettings();

    return () => unsubscribe();
  }, [user]);

  const checkPendingDeposit = async (userId: string) => {
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
      setUserStatus('pending_deposit');
    } else {
      // No tiene depósito pendiente pero tampoco plan activo
      // Probablemente rechazaron su depósito, mostrar selección de plan
      setUserStatus('no_plan');
    }
  };

  const loadSystemSettings = async () => {
    const settingsDoc = await getDoc(doc(db, 'system_settings', 'global'));
    if (settingsDoc.exists()) {
      setSystemSettings(settingsDoc.data() as SystemSettings);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        hasSelectedPlan: true,
        selectedPlanId: planId,
        updatedAt: serverTimestamp(),
      });

      // Crear depósito pendiente
      const plan = plans.find(p => p.id === planId);
      if (plan) {
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

        setUserStatus('pending_deposit');
      }

      toast({
        title: 'Plan seleccionado',
        description: 'Por favor realiza el depósito para activar tu plan',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: 'Error',
        description: 'No se pudo seleccionar el plan',
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

  // Pantalla de selección de plan
  const renderPlanSelection = () => (
    <div className="min-h-screen bg-[#0a0f1c] text-white p-4 pb-24">
      <div className="max-w-lg mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-3">Bienvenido, {user?.username}</h1>
          <p className="text-gray-400">Selecciona un plan de inversión para comenzar</p>
        </motion.div>

        <div className="space-y-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSelectPlan(plan.id)}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 cursor-pointer transition-all active:scale-95"
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-green-500 text-xs font-bold">
                  Popular
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shrink-0`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-xl">{plan.name}</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-400">${plan.price}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{plan.description}</p>
                  <p className="text-green-400 font-semibold mb-3">{plan.rate}% ganancia diaria</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((feature, j) => (
                      <span key={j} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4 h-12 bg-gradient-to-r from-green-500 to-emerald-600">
                Seleccionar Plan
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-gray-500">
          Todos los planes incluyen soporte y retiros garantizados
        </p>
      </div>
    </div>
  );

  // Pantalla de depósito pendiente con chat
  const renderPendingDeposit = () => {
    const plan = plans.find(p => p.id === pendingDeposit?.planId);
    if (!plan || !systemSettings) return null;

    return (
      <div className="min-h-screen bg-[#0a0f1c] text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 px-4 py-4 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg">Activar Plan</h1>
          </div>
        </header>

        <div className="p-4 pb-32 space-y-4">
          {/* Estado del depósito */}
          <GlassCard className="p-5" glow="yellow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Depósito en Revisión</h2>
                <p className="text-sm text-gray-400">Tu comprobante está siendo verificado</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monto:</span>
                <span className="font-semibold text-green-400">${plan.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Clock3 className="w-4 h-4" />
                  Pendiente
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Datos de pago */}
          <div>
            <h3 className="font-bold mb-3">Realizar depósito a:</h3>
            
            {/* Bancos */}
            <div className="space-y-3 mb-4">
              {systemSettings.bankAccounts?.filter(b => b.isActive).map((bank, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">{bank.bankName}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-400">Cuenta:</span> {bank.accountNumber}</p>
                    <p><span className="text-gray-400">Titular:</span> {bank.accountHolder}</p>
                    <p><span className="text-gray-400">Tipo:</span> {bank.accountType}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Crypto */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Bitcoin className="w-5 h-5 text-orange-400" />
                <span className="font-semibold">USDT (Crypto)</span>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">Red:</span> {systemSettings.cryptoWallets?.activeNetwork?.toUpperCase()}</p>
                <p className="break-all">
                  <span className="text-gray-400">Wallet:</span>{' '}
                  {systemSettings.cryptoWallets?.activeNetwork === 'trc20' 
                    ? systemSettings.cryptoWallets?.usdt_trc20 
                    : systemSettings.cryptoWallets?.usdt_bep20}
                </p>
              </div>
            </div>
          </div>

          {/* Subir comprobante */}
          <GlassCard className="p-5">
            <h3 className="font-bold mb-3">Subir comprobante</h3>
            
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">Arrastra una imagen o haz clic para seleccionar</p>
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
              <div className="space-y-3">
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
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Chat de soporte */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-5 h-5 text-green-400" />
              <h3 className="font-bold">Chat con Soporte</h3>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4 h-48 overflow-y-auto mb-3 space-y-3">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs">
                  EF
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-sm max-w-[80%]">
                  ¡Hola! ¿En qué puedo ayudarte con tu depósito?
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <div className="bg-green-500/20 rounded-lg p-3 text-sm max-w-[80%]">
                  He realizado el depósito, aquí está el comprobante
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-white/5 border-white/10"
              />
              <Button size="icon" className="bg-green-500">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  // Dashboard completo (usuario con plan activo)
  const renderActiveDashboard = () => (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex items-center justify-center p-4">
      <GlassCard className="p-8 text-center max-w-md">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Plan Activado!</h2>
        <p className="text-gray-400 mb-4">
          Tu plan está activo y comenzarás a recibir ganancias diarias.
        </p>
        <p className="text-sm text-gray-500">
          Dashboard completo en construcción...
        </p>
      </GlassCard>
    </div>
  );

  // Loading state
  if (userStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {userStatus === 'no_plan' && renderPlanSelection()}
      {userStatus === 'pending_deposit' && renderPendingDeposit()}
      {userStatus === 'active' && renderActiveDashboard()}
    </AnimatePresence>
  );
};
