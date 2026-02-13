import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, increment, limit } from 'firebase/firestore';
import { Play, RotateCcw, CheckCircle, DollarSign } from 'lucide-react';

export const AdminControls: React.FC = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Función para distribuir ganancias manualmente (simula la Cloud Function)
  const distributeDailyProfits = async () => {
    setIsProcessing(true);
    try {
      // Obtener todas las inversiones activas
      const investmentsQuery = query(
        collection(db, 'investments'),
        where('isActive', '==', true),
        where('status', '==', 'confirmed')
      );
      
      const investmentsSnapshot = await getDocs(investmentsQuery);
      let totalDistributed = 0;

      for (const investmentDoc of investmentsSnapshot.docs) {
        const investment = investmentDoc.data();
        const userId = investment.userId;
        
        // Calcular ganancia diaria
        const dailyRate = investment.dailyRate;
        const investedAmount = investment.amount;
        const dailyProfit = investedAmount * (dailyRate / 100);
        
        // Crear registro de ganancia
        await addDoc(collection(db, 'daily_profits'), {
          userId: userId,
          investmentId: investmentDoc.id,
          date: new Date().toISOString().split('T')[0],
          amount: dailyProfit,
          investmentAmount: investedAmount,
          dailyRate: dailyRate,
          isProcessed: true,
          processedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        // Actualizar balance del usuario (COMPUESTO)
        await updateDoc(doc(db, 'users', userId), {
          'balance.total': increment(dailyProfit),
          'balance.available': increment(dailyProfit),
          'balance.totalProfit': increment(dailyProfit),
          'balance.lastProfitDate': serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Actualizar inversión
        await updateDoc(investmentDoc.ref, {
          amount: increment(dailyProfit),
          totalProfitGenerated: increment(dailyProfit),
          updatedAt: serverTimestamp(),
        });

        // Procesar comisiones de referidos
        await processReferralCommissions(userId, dailyProfit);

        totalDistributed += dailyProfit;
      }

      toast({
        title: 'Ganancias distribuidas',
        description: `Total distribuido: $${totalDistributed.toFixed(2)} a ${investmentsSnapshot.size} inversiones`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error al distribuir ganancias', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const processReferralCommissions = async (userId: string, dailyProfit: number) => {
    try {
      // Obtener cadena de referidos
      const referralDoc = await getDocs(
        query(collection(db, 'referrals'), where('referredId', '==', userId), limit(1))
      );

      if (referralDoc.empty) return;

      const referral = referralDoc.docs[0].data();
      const referrerId = referral.referrerId;
      
      // Comisiones por nivel
      const commissionRates: { [key: number]: number } = {
        1: 0.02,  // Nivel 1: 2%
        2: 0.01,  // Nivel 2: 1%
        3: 0.005, // Nivel 3: 0.5%
        4: 0.002, // Nivel 4: 0.2%
        5: 0.001, // Nivel 5: 0.1%
      };

      let currentReferrerId = referrerId;
      let level = 1;

      while (currentReferrerId && level <= 5) {
        const commissionRate = commissionRates[level as number] || 0;
        const commissionAmount = dailyProfit * commissionRate;

        if (commissionAmount > 0) {
          await addDoc(collection(db, 'referral_commissions'), {
            referrerId: currentReferrerId,
            referredId: userId,
            level: level,
            sourceProfit: dailyProfit,
            commissionAmount: commissionAmount,
            commissionRate: commissionRate,
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp(),
          });

          await updateDoc(doc(db, 'users', currentReferrerId), {
            'balance.total': increment(commissionAmount),
            'balance.available': increment(commissionAmount),
            referralEarnings: increment(commissionAmount),
            updatedAt: serverTimestamp(),
          });
        }

        // Buscar siguiente nivel
        const parentReferral = await getDocs(
          query(collection(db, 'referrals'), where('referredId', '==', currentReferrerId), limit(1))
        );

        if (!parentReferral.empty) {
          currentReferrerId = parentReferral.docs[0].data().referrerId;
          level++;
        } else {
          break;
        }
      }
    } catch (error) {
      console.error('Error processing commissions:', error);
    }
  };

  // Generar operaciones del bot (simuladas)
  const generateBotOperations = async () => {
    setIsProcessing(true);
    try {
      const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'USD/CHF'];
      const operations = [];

      for (let i = 0; i < 5; i++) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const isWin = Math.random() > 0.4;
        const pips = isWin 
          ? Math.floor(Math.random() * 15) + 5
          : -Math.floor(Math.random() * 10) - 2;

        const operation = {
          pair: pair,
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          entryPrice: (Math.random() * 2 + 1).toFixed(4),
          exitPrice: (Math.random() * 2 + 1).toFixed(4),
          pips: pips,
          result: isWin ? 'win' : 'loss',
          timestamp: serverTimestamp(),
          date: new Date().toISOString().split('T')[0],
        };

        await addDoc(collection(db, 'bot_operations'), operation);
        operations.push(operation);
      }

      toast({
        title: 'Operaciones generadas',
        description: `${operations.length} operaciones creadas`,
        variant: 'success',
      });
    } catch (error) {
      toast({ title: 'Error al generar operaciones', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Controles del Sistema</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold">Distribuir Ganancias</h3>
              <p className="text-sm text-gray-400">Ejecutar distribución manual</p>
            </div>
          </div>
          <Button
            onClick={distributeDailyProfits}
            disabled={isProcessing}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {isProcessing ? (
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? 'Procesando...' : 'Distribuir Ahora'}
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Normalmente se ejecuta automáticamente cada 24h
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold">Generar Operaciones Bot</h3>
              <p className="text-sm text-gray-400">Crear operaciones simuladas</p>
            </div>
          </div>
          <Button
            onClick={generateBotOperations}
            disabled={isProcessing}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isProcessing ? (
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? 'Generando...' : 'Generar Operaciones'}
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Crea 5 operaciones simuladas para mostrar a los usuarios
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
