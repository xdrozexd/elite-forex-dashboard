const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

async function deployRules() {
  try {
    console.log('📋 Leyendo reglas de Firestore...');
    const rulesPath = path.join(__dirname, '..', 'firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');
    
    console.log('🚀 Deployando reglas a Firestore...');
    
    // Usar REST API para deployar reglas
    const projectId = serviceAccount.project_id;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):updateSecurityRules`;
    
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rules: {
          rulesFiles: [{
            content: rules,
            name: 'firestore.rules'
          }]
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Reglas deployadas exitosamente!');
    } else {
      const error = await response.text();
      console.error('❌ Error deployando reglas:', error);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deployRules();
