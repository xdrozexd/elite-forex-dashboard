const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function makeAdmin(userId) {
  if (!userId) {
    console.error('❌ Please provide a user ID');
    console.log('Usage: node makeAdmin.js <USER_ID>');
    process.exit(1);
  }

  try {
    console.log(`Making user ${userId} an admin...`);
    
    await db.collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ User is now admin!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get user ID from command line
const userId = process.argv[2];
makeAdmin(userId);
