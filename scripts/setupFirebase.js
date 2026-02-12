const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "elite-forex-bot.firebasestorage.app"
});

const db = admin.firestore();

async function setupFirebase() {
  console.log('🚀 Starting Firebase setup...\n');

  try {
    // 1. Create admin user (you need to provide your UID)
    console.log('1️⃣ Please provide your user UID to make it admin:');
    console.log('   - Go to Firebase Console > Authentication > Users');
    console.log('   - Copy your UID');
    console.log('   - Then run: node makeAdmin.js <YOUR_UID>');

    // 2. Create system_settings
    console.log('\n2️⃣ Creating system_settings...');
    await db.collection('system_settings').doc('global').set({
      withdrawalSchedule: {
        enabledDays: ['monday', 'wednesday', 'friday'],
        startHour: 9,
        endHour: 17
      },
      currentWithdrawalStatus: 'enabled',
      plans: {
        basic: {
          name: 'Básico',
          minAmount: 50,
          dailyRate: 0.5,
          features: ['Señales básicas', 'Retiros en 48h', 'Soporte email'],
          description: 'Plan inicial para comenzar'
        },
        intermediate: {
          name: 'Intermedio',
          minAmount: 200,
          dailyRate: 0.85,
          features: ['Señales avanzadas', 'Retiros en 24h', 'Soporte priority', 'Análisis tiempo real'],
          description: 'Mayor rendimiento y beneficios'
        },
        premium: {
          name: 'Premium',
          minAmount: 500,
          dailyRate: 1.5,
          features: ['Señales VIP', 'Retiros en 4h', 'Soporte 24/7', 'Account manager'],
          description: 'Máximo rendimiento y atención personalizada'
        }
      },
      cryptoWallets: {
        usdt_trc20: 'TU_WALLET_USDT_TRC20_AQUI',
        usdt_bep20: 'TU_WALLET_USDT_BEP20_AQUI',
        activeNetwork: 'trc20'
      },
      bankAccounts: [
        {
          bankName: 'Banco Popular Dominicano',
          accountNumber: '1234567890',
          accountHolder: 'Elite Forex SRL',
          accountType: 'Ahorro',
          isActive: true,
          isDefault: true
        },
        {
          bankName: 'Banco BHD León',
          accountNumber: '0987654321',
          accountHolder: 'Elite Forex SRL',
          accountType: 'Corriente',
          isActive: true,
          isDefault: false
        }
      ],
      maintenanceMode: false,
      lastProfitDistribution: admin.firestore.Timestamp.fromDate(new Date()),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('   ✅ system_settings created');

    // 3. Create initial data structure
    console.log('\n3️⃣ Setting up initial data structure...');
    
    // Create a test deposit document structure (will be deleted)
    await db.collection('deposits').doc('_structure').set({
      _description: 'This document defines the structure',
      fields: {
        userId: 'string',
        amount: 'number',
        type: 'initial | topup | plan_upgrade',
        paymentMethod: 'bank_transfer_rd | crypto_usdt',
        status: 'pending | confirmed | rejected',
        proofImage: 'string (URL)',
        createdAt: 'timestamp'
      }
    });
    await db.collection('deposits').doc('_structure').delete();
    console.log('   ✅ Data structure validated');

    console.log('\n✨ Setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Update bank account numbers in system_settings');
    console.log('   2. Update crypto wallet addresses');
    console.log('   3. Deploy Cloud Functions');
    console.log('   4. Make your user an admin');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupFirebase();
