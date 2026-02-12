const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Daily profit distribution function
exports.distributeDailyProfits = functions.pubsub
  .schedule('0 0 * * *') // Run every day at midnight
  .timeZone('America/Santo_Domingo')
  .onRun(async (context) => {
    console.log('Starting daily profit distribution...');
    
    const today = new Date().toISOString().split('T')[0];
    const now = admin.firestore.Timestamp.now();
    
    try {
      // Get all active investments
      const investmentsSnapshot = await db.collection('investments')
        .where('isActive', '==', true)
        .where('status', '==', 'confirmed')
        .get();
      
      if (investmentsSnapshot.empty) {
        console.log('No active investments found');
        return null;
      }
      
      console.log(`Processing ${investmentsSnapshot.size} active investments...`);
      
      const batch = db.batch();
      let totalDistributed = 0;
      
      for (const investmentDoc of investmentsSnapshot.docs) {
        const investment = investmentDoc.data();
        
        // Calculate daily profit
        const dailyProfit = investment.amount * (investment.dailyRate / 100);
        totalDistributed += dailyProfit;
        
        // Create profit record
        const profitRef = db.collection('daily_profits').doc();
        batch.set(profitRef, {
          userId: investment.userId,
          investmentId: investmentDoc.id,
          date: today,
          amount: dailyProfit,
          investmentAmount: investment.amount,
          dailyRate: investment.dailyRate,
          isProcessed: true,
          processedAt: now,
          createdAt: now
        });
        
        // Update investment
        batch.update(investmentDoc.ref, {
          totalProfitGenerated: admin.firestore.FieldValue.increment(dailyProfit),
          lastProfitDate: now,
          updatedAt: now
        });
        
        // Update user balance
        const userRef = db.collection('users').doc(investment.userId);
        batch.update(userRef, {
          'balance.total': admin.firestore.FieldValue.increment(dailyProfit),
          'balance.available': admin.firestore.FieldValue.increment(dailyProfit),
          'balance.totalProfit': admin.firestore.FieldValue.increment(dailyProfit),
          'balance.lastProfitDate': now,
          updatedAt: now
        });
      }
      
      // Commit all changes
      await batch.commit();
      
      // Update system settings
      await db.collection('system_settings').doc('global').update({
        lastProfitDistribution: now,
        updatedAt: now
      });
      
      console.log(`✅ Distributed $${totalDistributed.toFixed(2)} to ${investmentsSnapshot.size} investments`);
      
      // Send notifications (optional)
      // await sendProfitNotifications(investmentsSnapshot.docs);
      
      return { success: true, distributed: totalDistributed, count: investmentsSnapshot.size };
      
    } catch (error) {
      console.error('Error distributing profits:', error);
      throw new functions.https.HttpsError('internal', 'Failed to distribute profits');
    }
  });

// Manual trigger for testing
exports.manualProfitDistribution = functions.https.onCall(async (data, context) => {
  // Verify admin
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger manual distribution');
  }
  
  // Trigger the same logic
  const result = await exports.distributeDailyProfits({});
  return result;
});
