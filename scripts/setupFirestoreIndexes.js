const admin = require('firebase-admin');

// Initialize Firebase Admin with the provided credentials
const serviceAccount = {
  "type": "service_account",
  "project_id": "elite-forex-bot",
  "private_key_id": "3bb81214cbf8800bdab8429c3b38667cb3c6860d",
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4FlbWcpjPJapj
W5N9mkPeqjO+Bh4pCBBlM5fC1+iaxhX4cYklRqFXX8b7GMkmyKs6HGYtCQyTnrJp
vJruOLcbTlNxGysqHBBfaJ42oE5skUTNtd/+hKIn6XSvs46Mjdqbm87SUaHgFcA1
ZbgSVM11QDe8JfoJour0YFHBSVoOgFnbCkS9iVjfCSZyS0hjmQ6tt3sY/FG4eKZU
auc8HapO9iv7b/mUfFAiUekK+Hr+Z6wVIp43CGqRdTdN1mUsuzBhpAMPubiDebso
dGCxDACjgNOhUZ7kTfgBwCcvTSEhx1wSNZPHtUUOV+h52CFzmpF5w4oWcm9VU6yE
MdMxNIafAgMBAAECggEAAPvMPVDBxJg+F6d6xhjdFE39gR5AQADf3DfmhNnUJNY6
cig3zuADPFfHKjqg1y5gTSsErWiXIsdzdZbWjxT01CuwIh0T4cw3ltg/bCmhcaQP
EDhQuOfq2TgT8bJjExjY76w+nSdm1tnW5pIjZc8ChVtb+4s1EaMctUSPJe9nO0eY
TAnFC9OLFDS/KE4q5KF4h+llENnIIt+qiUwY9KYyJeOVLL/9v81L2tmRKIZpXVY0
Rq9pPYYze2vOgehDrwZSTOwASyLRTuEc3kk5NmBGfB5pS74qAocZZCC69/znp8UD
gh/RIuoC4w8uLI2JPX5X9wvq6lyETHUYuEckNLtDzQKBgQDcThcJ2y97yHzcbHUP
nXvqryEUJJXVNbfrkmbsDKK/M4HQ3q8gkfy94U/BwyY0apzFsHAKTUztCTD/qTUt
ZSstiEw/RdbNwnsCA9NzJ6R1p8XSLOBFqKBDqzhLc3R2FJCp11hT3HLYKKA2m8gj
vh5dDdOrCs9vrGXeSQnkgVbNYwKBgQDV6f4DQHkgKkr1Drzau9s5pbGXJftFUoYv
4RxJmKUakL8AVkP0k5Wh/LWgscbnHJN/weUy2TQ8YHSFWMOiTlI9pRgA2vxNTkXx
wQNCZCDaBHUgx1PrrKwuBM34shG1pYU0v67hEz01pi+qQ6aff+7kkgn5Z2/T744G
vOb/9dPUlQKBgQCk493ihqd3ooux/4tucJT7BrFffjKXLmnGbAGU07BMI6UaTFIP
srTU+frUL9g8iz9jx7dUPp9BGwwNjvw6SeqTXdyTzxYDU3j1/R8apaU2Wqh5sxT5
jkjF3TV5Y6TbbHEKbh+yROHAYEfqF5cpCXd4dozjDGhOUV69jTVWTmhFuQKBgF/o
8gLzPVu2mrUVToekAr7uE5n5ZZfHUHLXM5+r2Rr4GytDgmR+Z3Chpa3PB6dHoLp/
bQxHZqxLcvL2wYBcLXOGOiToCod+uM2UBKoXysL1jK6NsIrSeMCJVvBSpq4S8I6e
AwLXZXJQeL6WZnbNHYdOEzrHrdQQbFWJDOlmhvuhAoGANIEmJ4OGdw0UZ73Xi9M7
L2PiKmxsf0njTgAH3hxCO6EnMl7PfGnth951vHS4FCwdM8LoUPa9NiNBW4bzaTO8
4ZuqvY+Xu1clP3IrXf1he02EM2W9oQGnLWycMeOvC702VnHU+RZewJwfBWNWwtUO
0NFEcGwgwF5shAElhVvCLsw=
-----END PRIVATE KEY-----`,
  "client_email": "firebase-adminsdk-fbsvc@elite-forex-bot.iam.gserviceaccount.com",
  "client_id": "106052667989258437067",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40elite-forex-bot.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

async function createIndexes() {
  console.log('🔧 Creando índices de Firestore...\n');
  
  const indexes = [
    // Índices para users
    {
      collectionGroup: 'users',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'role', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'users',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'plan.isActive', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    
    // Índices para deposits
    {
      collectionGroup: 'deposits',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'deposits',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    
    // Índices para withdrawals
    {
      collectionGroup: 'withdrawals',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'withdrawals',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    
    // Índices para investments
    {
      collectionGroup: 'investments',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'investments',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    },
    
    // Índices para transactions
    {
      collectionGroup: 'transactions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    
    // Índices para referrals
    {
      collectionGroup: 'referrals',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'referrerId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'referrals',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'referredId', order: 'ASCENDING' },
        { fieldPath: 'level', order: 'ASCENDING' }
      ]
    },
    
    // Índices para daily_profits
    {
      collectionGroup: 'daily_profits',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'daily_profits',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'investmentId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' }
      ]
    },
    
    // Índices para bot_operations
    {
      collectionGroup: 'bot_operations',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'bot_operations',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'date', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },
    
    // Índices para chats
    {
      collectionGroup: 'chats',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'lastMessageAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'chats',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' }
      ]
    },
    
    // Índices para messages (subcollection)
    {
      collectionGroup: 'messages',
      queryScope: 'COLLECTION_GROUP',
      fields: [
        { fieldPath: 'timestamp', order: 'ASCENDING' }
      ]
    },
    
    // Índices para notifications
    {
      collectionGroup: 'notifications',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'read', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    
    // Índices para referral_commissions
    {
      collectionGroup: 'referral_commissions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'referrerId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'referral_commissions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'referredId', order: 'ASCENDING' },
        { fieldPath: 'type', order: 'ASCENDING' }
      ]
    }
  ];
  
  try {
    // Note: Firestore indexes must be created via Firebase Console or gcloud CLI
    // This script documents the required indexes
    
    console.log('📋 Índices necesarios para Firestore:');
    console.log('='.repeat(60));
    
    indexes.forEach((index, i) => {
      console.log(`\n${i + 1}. Colección: ${index.collectionGroup}`);
      console.log(`   Scope: ${index.queryScope}`);
      console.log('   Campos:');
      index.fields.forEach(field => {
        console.log(`     - ${field.fieldPath} (${field.order})`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Índices documentados.');
    console.log('\n⚠️  IMPORTANTE: Debes crear estos índices manualmente en:');
    console.log('   https://console.firebase.google.com/project/elite-forex-bot/firestore/indexes');
    console.log('\n📖 O usa el archivo firestore.indexes.json que he creado.\n');
    
    // Guardar índices en formato JSON para importar
    const indexesJson = {
      indexes: indexes.map(idx => ({
        collectionGroup: idx.collectionGroup,
        queryScope: idx.queryScope,
        fields: idx.fields
      })),
      fieldOverrides: []
    };
    
    const fs = require('fs');
    fs.writeFileSync('firestore.indexes.json', JSON.stringify(indexesJson, null, 2));
    console.log('📝 Archivo firestore.indexes.json creado.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
createIndexes().then(() => {
  console.log('✨ Configuración completada.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
