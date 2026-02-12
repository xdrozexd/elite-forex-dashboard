const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Actualizar estructura de usuarios y crear índices necesarios
async function setupDatabase() {
  console.log('🚀 Configurando estructura de base de datos...\n');

  try {
    // 1. Actualizar usuarios existentes con nueva estructura
    console.log('1️⃣ Actualizando estructura de usuarios...');
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      await userDoc.ref.update({
        hasSelectedPlan: userData.plan?.currentPlanId ? true : false,
        selectedPlanId: userData.plan?.currentPlanId || null,
        notifications: {
          unreadCount: 0,
          lastReadAt: admin.firestore.FieldValue.serverTimestamp()
        },
        supportChat: {
          hasUnreadMessages: false,
          lastMessageAt: null
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log(`   ✅ ${usersSnapshot.size} usuarios actualizados`);

    // 2. Crear estructura de notificaciones para admin
    console.log('\n2️⃣ Configurando notificaciones del sistema...');
    await db.collection('admin_notifications').doc('global').set({
      unreadCount: 0,
      lastCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        depositAlerts: true,
        withdrawalAlerts: true,
        chatAlerts: true
      }
    });
    console.log('   ✅ Notificaciones configuradas');

    // 3. Crear colección de configuraciones
    console.log('\n3️⃣ Verificando system_settings...');
    const settingsDoc = await db.collection('system_settings').doc('global').get();
    
    if (settingsDoc.exists) {
      await settingsDoc.ref.update({
        chatSettings: {
          enabled: true,
          autoReplyEnabled: false,
          adminResponseTime: '24h'
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('   ✅ Configuraciones de chat añadidas');
    }

    // 4. Actualizar depósitos con campo de tipo
    console.log('\n4️⃣ Actualizando estructura de depósitos...');
    const depositsSnapshot = await db.collection('deposits').get();
    
    for (const depositDoc of depositsSnapshot.docs) {
      const depositData = depositDoc.data();
      if (!depositData.type) {
        await depositDoc.ref.update({
          type: 'initial',
          chatMessages: []
        });
      }
    }
    console.log(`   ✅ ${depositsSnapshot.size} depósitos actualizados`);

    console.log('\n✨ Configuración completada exitosamente!\n');
    
    console.log('📋 Resumen de cambios:');
    console.log('   - Usuarios tienen campos: hasSelectedPlan, notifications, supportChat');
    console.log('   - Colección admin_notifications creada');
    console.log('   - Configuraciones de chat añadidas');
    console.log('   - Depósitos actualizados con tipo y chatMessages');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupDatabase();
