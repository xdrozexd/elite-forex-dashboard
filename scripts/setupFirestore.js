const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize with service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

async function setupFirestore() {
  console.log('🔧 Configurando Firestore...\n');
  
  try {
    // 1. Deploy Firestore Rules
    console.log('📋 1. Leyendo reglas de seguridad...');
    const rulesPath = path.join(__dirname, '..', 'firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');
    
    console.log('✅ Reglas listas para deployar');
    console.log('⚠️  Debes copiar estas reglas manualmente a Firebase Console:\n');
    console.log('='.repeat(60));
    console.log(rules);
    console.log('='.repeat(60));
    
    // 2. Setup Indexes
    console.log('\n📊 2. Configurando índices...');
    const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
    const indexes = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
    
    console.log(`📋 Índices a crear: ${indexes.indexes.length}`);
    
    // Create initial collections with sample documents to trigger index creation
    console.log('\n📝 Creando colecciones de ejemplo para activar índices...');
    
    // Create sample deposit
    const depositRef = firestore.collection('deposits').doc('sample-deposit');
    await depositRef.set({
      userId: 'sample-user',
      amount: 100,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      planId: 'basic',
      type: 'initial'
    });
    console.log('✅ Colección deposits creada');
    
    // Create sample withdrawal
    const withdrawalRef = firestore.collection('withdrawals').doc('sample-withdrawal');
    await withdrawalRef.set({
      userId: 'sample-user',
      amount: 50,
      finalAmount: 45,
      penaltyAmount: 5,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      method: 'bank_transfer_rd'
    });
    console.log('✅ Colección withdrawals creada');
    
    // Create sample investment
    const investmentRef = firestore.collection('investments').doc('sample-investment');
    await investmentRef.set({
      userId: 'sample-user',
      plan: 'basic',
      amount: 100,
      dailyRate: 0.5,
      isActive: true,
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colección investments creada');
    
    // Create sample referral
    const referralRef = firestore.collection('referrals').doc('sample-referral');
    await referralRef.set({
      referrerId: 'sample-referrer',
      referredId: 'sample-referred',
      level: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colección referrals creada');
    
    // Create sample daily profit
    const profitRef = firestore.collection('daily_profits').doc('sample-profit');
    await profitRef.set({
      userId: 'sample-user',
      investmentId: 'sample-investment',
      date: '2024-01-15',
      amount: 0.5,
      dailyRate: 0.5,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colección daily_profits creada');
    
    // Create sample transaction
    const transactionRef = firestore.collection('transactions').doc('sample-transaction');
    await transactionRef.set({
      userId: 'sample-user',
      type: 'deposit',
      amount: 100,
      status: 'completed',
      description: 'Depósito de prueba',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colección transactions creada');
    
    // Create sample bot operation
    const operationRef = firestore.collection('bot_operations').doc('sample-operation');
    await operationRef.set({
      pair: 'EUR/USD',
      type: 'BUY',
      pips: 10,
      result: 'win',
      date: '2024-01-15',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colección bot_operations creada');
    
    // Create sample notification
    const notificationRef = firestore.collection('notifications').doc('sample-notification');
    await notificationRef.set({
      userId: 'sample-user',
      title: 'Bienvenido',
      message: 'Bienvenido a Elite Forex',
      type: 'system',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colección notifications creada');
    
    // Create sample referral commission
    const commissionRef = firestore.collection('referral_commissions').doc('sample-commission');
    await commissionRef.set({
      referrerId: 'sample-referrer',
      referredId: 'sample-referred',
      level: 1,
      type: 'first_deposit',
      depositAmount: 100,
      commissionAmount: 10,
      commissionRate: 0.10,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colección referral_commissions creada');
    
    // Create sample chat
    const chatRef = firestore.collection('chats').doc('sample-chat');
    await chatRef.set({
      userId: 'sample-user',
      userName: 'Usuario Prueba',
      userEmail: 'test@example.com',
      lastMessage: 'Hola, necesito ayuda',
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      unreadCount: 1,
      status: 'active'
    });
    console.log('✅ Colección chats creada');
    
    // Create sample message
    const messageRef = firestore.collection('chats').doc('sample-chat').collection('messages').doc('sample-message');
    await messageRef.set({
      userId: 'sample-user',
      userName: 'Usuario Prueba',
      userRole: 'user',
      message: 'Hola, necesito ayuda',
      type: 'text',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });
    console.log('✅ Colección messages creada');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CONFIGURACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log('\n📋 RESUMEN:');
    console.log('   ✅ Colecciones creadas en Firestore');
    console.log('   ✅ Documentos de ejemplo creados');
    console.log('   ✅ Índices activados automáticamente');
    console.log('\n⚠️  ACCIONES MANUALES NECESARIAS:');
    console.log('   1. Copiar reglas de seguridad a Firebase Console:');
    console.log('      https://console.firebase.google.com/project/elite-forex-bot/firestore/rules');
    console.log('\n   2. Las Cloud Functions deben crearse en:');
    console.log('      https://console.firebase.google.com/project/elite-forex-bot/functions');
    console.log('\n   3. Verificar índices en:');
    console.log('      https://console.firebase.google.com/project/elite-forex-bot/firestore/indexes');
    console.log('\n🧹 Los documentos de ejemplo pueden eliminarse después');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupFirestore();
