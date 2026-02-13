const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Distribución automática de ganancias diarias
 * Se ejecuta todos los días a las 00:00 (medianoche hora Santo Domingo)
 */
exports.distributeDailyProfits = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/Santo_Domingo')
  .onRun(async (context) => {
    console.log('🤖 Iniciando distribución de ganancias diarias...');
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    try {
      // Obtener todas las inversiones activas
      const investmentsSnapshot = await db.collection('investments')
        .where('isActive', '==', true)
        .where('status', '==', 'confirmed')
        .get();
      
      console.log(`📊 Total de inversiones activas: ${investmentsSnapshot.size}`);
      
      const batch = db.batch();
      let totalDistributed = 0;
      let totalCommissions = 0;
      
      for (const investmentDoc of investmentsSnapshot.docs) {
        const investment = investmentDoc.data();
        const userId = investment.userId;
        
        // Calcular ganancia diaria
        const dailyRate = investment.dailyRate;
        const investedAmount = investment.amount;
        const dailyProfit = investedAmount * (dailyRate / 100);
        
        // Verificar si ya se procesó hoy
        const existingProfit = await db.collection('daily_profits')
          .where('investmentId', '==', investmentDoc.id)
          .where('date', '==', dateStr)
          .get();
        
        if (!existingProfit.empty) {
          console.log(`⚠️ Ya se procesó la ganancia para inversión ${investmentDoc.id} hoy`);
          continue;
        }
        
        // Crear registro de ganancia diaria
        const profitRef = db.collection('daily_profits').doc();
        batch.set(profitRef, {
          userId: userId,
          investmentId: investmentDoc.id,
          date: dateStr,
          amount: dailyProfit,
          investmentAmount: investedAmount,
          dailyRate: dailyRate,
          isProcessed: true,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Actualizar balance del usuario (COMPUESTO - se suma al capital)
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentBalance = userData.balance || {};
          
          batch.update(userRef, {
            'balance.total': admin.firestore.FieldValue.increment(dailyProfit),
            'balance.available': admin.firestore.FieldValue.increment(dailyProfit),
            'balance.totalProfit': admin.firestore.FieldValue.increment(dailyProfit),
            'balance.lastProfitDate': admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          // Actualizar inversión (capital + ganancia)
          batch.update(investmentDoc.ref, {
            amount: admin.firestore.FieldValue.increment(dailyProfit),
            totalProfitGenerated: admin.firestore.FieldValue.increment(dailyProfit),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          totalDistributed += dailyProfit;
          
          // Calcular comisiones de referidos
          const commissions = await calculateReferralCommissions(userId, dailyProfit, batch);
          totalCommissions += commissions;
        }
      }
      
      // Ejecutar batch
      await batch.commit();
      
      // Registrar log del sistema
      await db.collection('system_logs').add({
        type: 'daily_profit_distribution',
        date: dateStr,
        totalInvestments: investmentsSnapshot.size,
        totalDistributed: totalDistributed,
        totalCommissions: totalCommissions,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`✅ Distribución completada:`);
      console.log(`   💰 Total distribuido: $${totalDistributed.toFixed(2)}`);
      console.log(`   👥 Comisiones pagadas: $${totalCommissions.toFixed(2)}`);
      
      return null;
    } catch (error) {
      console.error('❌ Error distribuyendo ganancias:', error);
      throw error;
    }
  });

/**
 * Calcular y pagar comisiones de referidos multinivel
 */
async function calculateReferralCommissions(userId, dailyProfit, batch) {
  let totalCommissions = 0;
  
  try {
    // Obtener el árbol de referidos del usuario
    const referralsSnapshot = await db.collection('referrals')
      .where('referredId', '==', userId)
      .get();
    
    if (referralsSnapshot.empty) return 0;
    
    const referral = referralsSnapshot.docs[0].data();
    const referrerId = referral.referrerId;
    const level = referral.level;
    
    // Definir porcentajes por nivel
    const commissionRates = {
      1: 0.02,  // Nivel 1: 2% de ganancias diarias
      2: 0.01,  // Nivel 2: 1%
      3: 0.005, // Nivel 3: 0.5%
      4: 0.002, // Nivel 4: 0.2%
      5: 0.001, // Nivel 5: 0.1%
    };
    
    // Subir por la cadena de referidos
    let currentReferrerId = referrerId;
    let currentLevel = 1;
    
    while (currentReferrerId && currentLevel <= 5) {
      const commissionRate = commissionRates[currentLevel] || 0;
      const commissionAmount = dailyProfit * commissionRate;
      
      if (commissionAmount > 0) {
        // Crear registro de comisión
        const commissionRef = db.collection('referral_commissions').doc();
        batch.set(commissionRef, {
          referrerId: currentReferrerId,
          referredId: userId,
          level: currentLevel,
          sourceProfit: dailyProfit,
          commissionAmount: commissionAmount,
          commissionRate: commissionRate,
          date: new Date().toISOString().split('T')[0],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Acreditar al patrocinador
        const referrerRef = db.collection('users').doc(currentReferrerId);
        batch.update(referrerRef, {
          'balance.total': admin.firestore.FieldValue.increment(commissionAmount),
          'balance.available': admin.firestore.FieldValue.increment(commissionAmount),
          'referralEarnings': admin.firestore.FieldValue.increment(commissionAmount),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        totalCommissions += commissionAmount;
      }
      
      // Buscar el siguiente nivel (padre del padre)
      const parentReferral = await db.collection('referrals')
        .where('referredId', '==', currentReferrerId)
        .get();
      
      if (!parentReferral.empty) {
        currentReferrerId = parentReferral.docs[0].data().referrerId;
        currentLevel++;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error('Error calculando comisiones:', error);
  }
  
  return totalCommissions;
}

/**
 * Generar operaciones simuladas del bot
 * Se ejecuta cada 3 horas durante el día
 */
exports.generateBotOperations = functions.pubsub
  .schedule('0 */3 * * *')
  .timeZone('America/Santo_Domingo')
  .onRun(async (context) => {
    console.log('🤖 Generando operaciones del bot...');
    
    const pairs = [
      { pair: 'EUR/USD', volatility: 0.8 },
      { pair: 'GBP/USD', volatility: 1.2 },
      { pair: 'USD/JPY', volatility: 0.6 },
      { pair: 'XAU/USD', volatility: 1.5 },
      { pair: 'USD/CHF', volatility: 0.7 },
    ];
    
    const operations = [];
    const numOperations = Math.floor(Math.random() * 3) + 3; // 3-5 operaciones
    
    for (let i = 0; i < numOperations; i++) {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const isWin = Math.random() > 0.4; // 60% win rate
      const pips = isWin 
        ? Math.floor(Math.random() * 15) + 5  // 5-20 pips ganancia
        : -Math.floor(Math.random() * 10) - 2; // 2-12 pips pérdida
      
      const operation = {
        pair: pair.pair,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entryPrice: (Math.random() * 2 + 1).toFixed(4),
        exitPrice: (Math.random() * 2 + 1).toFixed(4),
        pips: pips,
        result: isWin ? 'win' : 'loss',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
      };
      
      operations.push(operation);
      
      // Guardar en Firestore
      await db.collection('bot_operations').add(operation);
    }
    
    console.log(`✅ ${operations.length} operaciones generadas`);
    return null;
  });

/**
 * Procesar depósito aprobado
 * Cuando el admin aprueba un depósito
 */
exports.onDepositApproved = functions.firestore
  .document('deposits/{depositId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // Verificar si cambió a estado 'confirmed'
    if (oldData.status !== 'confirmed' && newData.status === 'confirmed') {
      console.log(`💰 Procesando depósito aprobado: ${context.params.depositId}`);
      
      const userId = newData.userId;
      const amount = newData.amount;
      const planId = newData.planId;
      
      // Obtener datos del plan
      const plans = {
        basic: { rate: 0.5, minAmount: 50 },
        intermediate: { rate: 0.85, minAmount: 200 },
        premium: { rate: 1.35, minAmount: 500 },
      };
      
      const plan = plans[planId] || plans.basic;
      
      // Calcular bono de bienvenida
      let bonusPercent = 0;
      if (amount >= 1000) bonusPercent = 0.20;
      else if (amount >= 500) bonusPercent = 0.15;
      else if (amount >= 200) bonusPercent = 0.125;
      else bonusPercent = 0.10;
      
      const bonusAmount = amount * bonusPercent;
      const totalAmount = amount + bonusAmount;
      
      // Crear inversión
      await db.collection('investments').add({
        userId: userId,
        plan: planId,
        amount: totalAmount,
        initialAmount: amount,
        bonusAmount: bonusAmount,
        dailyRate: plan.rate,
        totalProfitGenerated: 0,
        startDate: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        status: 'confirmed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Actualizar usuario
      await db.collection('users').doc(userId).update({
        'plan.currentPlanId': planId,
        'plan.investedAmount': totalAmount,
        'plan.initialAmount': amount,
        'plan.bonusAmount': bonusAmount,
        'plan.isActive': true,
        'balance.total': admin.firestore.FieldValue.increment(totalAmount),
        'balance.invested': admin.firestore.FieldValue.increment(totalAmount),
        hasSelectedPlan: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Pagar comisión de referido (primer depósito)
      await payReferralCommission(userId, amount);
      
      // Crear transacción
      await db.collection('transactions').add({
        userId: userId,
        type: 'deposit',
        amount: amount,
        bonusAmount: bonusAmount,
        totalAmount: totalAmount,
        status: 'completed',
        description: `Depósito aprobado + Bono ${(bonusPercent * 100).toFixed(0)}%`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Notificar al usuario
      await db.collection('notifications').add({
        userId: userId,
        title: 'Depósito Confirmado',
        message: `Tu depósito de $${amount} fue aprobado. ¡Tu plan está activo!`,
        type: 'deposit',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

/**
 * Pagar comisión por primer depósito de referido
 */
async function payReferralCommission(userId, depositAmount) {
  try {
    const referralDoc = await db.collection('referrals')
      .where('referredId', '==', userId)
      .limit(1)
      .get();
    
    if (referralDoc.empty) return;
    
    const referral = referralDoc.docs[0].data();
    const referrerId = referral.referrerId;
    
    // Solo pagar una vez por primer depósito
    const existingCommission = await db.collection('referral_commissions')
      .where('referredId', '==', userId)
      .where('type', '==', 'first_deposit')
      .get();
    
    if (!existingCommission.empty) return;
    
    // Comisión del 10% para nivel 1
    const commissionAmount = depositAmount * 0.10;
    
    // Crear registro
    await db.collection('referral_commissions').add({
      referrerId: referrerId,
      referredId: userId,
      level: 1,
      type: 'first_deposit',
      depositAmount: depositAmount,
      commissionAmount: commissionAmount,
      commissionRate: 0.10,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Acreditar al referidor
    await db.collection('users').doc(referrerId).update({
      'balance.total': admin.firestore.FieldValue.increment(commissionAmount),
      'balance.available': admin.firestore.FieldValue.increment(commissionAmount),
      'referralEarnings': admin.firestore.FieldValue.increment(commissionAmount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Notificar al referidor
    await db.collection('notifications').add({
      userId: referrerId,
      title: '¡Nueva Comisión!',
      message: `Has ganado $${commissionAmount.toFixed(2)} por el depósito de tu referido`,
      type: 'referral',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
  } catch (error) {
    console.error('Error pagando comisión de referido:', error);
  }
}

/**
 * Procesar retiro
 */
exports.processWithdrawal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }
  
  const userId = context.auth.uid;
  const { amount, method, accountInfo } = data;
  
  try {
    // Verificar saldo disponible
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || userData.balance.available < amount) {
      throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente');
    }
    
    // Verificar período mínimo (7 días)
    const investmentDoc = await db.collection('investments')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    let penaltyAmount = 0;
    let finalAmount = amount;
    
    if (!investmentDoc.empty) {
      const investment = investmentDoc.docs[0].data();
      const startDate = investment.startDate.toDate();
      const daysSinceStart = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceStart < 7) {
        // Aplicar penalización del 10%
        penaltyAmount = amount * 0.10;
        finalAmount = amount - penaltyAmount;
      }
    }
    
    // Crear solicitud de retiro
    const withdrawalRef = await db.collection('withdrawals').add({
      userId: userId,
      amount: amount,
      finalAmount: finalAmount,
      penaltyAmount: penaltyAmount,
      method: method,
      accountInfo: accountInfo,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Reservar el monto (descontar del balance disponible)
    await db.collection('users').doc(userId).update({
      'balance.available': admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return {
      success: true,
      withdrawalId: withdrawalRef.id,
      message: `Solicitud de retiro creada. Monto: $${finalAmount} (Penalización: $${penaltyAmount})`,
    };
    
  } catch (error) {
    console.error('Error procesando retiro:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Registrar nuevo referido
 */
exports.registerReferral = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }
  
  const referredId = context.auth.uid;
  const { referralCode } = data;
  
  try {
    // Buscar al patrocinador por código
    const referrerSnapshot = await db.collection('users')
      .where('referralCode', '==', referralCode.toUpperCase())
      .limit(1)
      .get();
    
    if (referrerSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'Código de referido no válido');
    }
    
    const referrerId = referrerSnapshot.docs[0].id;
    
    // Verificar que no sea el mismo usuario
    if (referrerId === referredId) {
      throw new functions.https.HttpsError('invalid-argument', 'No puedes referirte a ti mismo');
    }
    
    // Calcular nivel en la cadena
    let level = 1;
    let currentParentId = referrerId;
    
    // Buscar la cadena de referidos hasta 5 niveles
    const chain = [referrerId];
    
    while (chain.length < 5) {
      const parentDoc = await db.collection('referrals')
        .where('referredId', '==', currentParentId)
        .limit(1)
        .get();
      
      if (parentDoc.empty) break;
      
      const parent = parentDoc.docs[0].data();
      chain.push(parent.referrerId);
      currentParentId = parent.referrerId;
    }
    
    // Crear relación de referido
    await db.collection('referrals').add({
      referrerId: referrerId,
      referredId: referredId,
      level: 1,
      chain: chain,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Actualizar contador de referidos del patrocinador
    await db.collection('users').doc(referrerId).update({
      totalReferrals: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { success: true, message: 'Referido registrado correctamente' };
    
  } catch (error) {
    console.error('Error registrando referido:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
