# 🔧 Configuración de Firebase - Elite Forex

## 📋 Estado de la Configuración

### ✅ Completado:
1. Service Account Key guardado
2. Scripts de setup creados
3. Cloud Function de ganancias diarias lista
4. Estructura de datos definida

### ⏳ Pendiente (requiere tu intervención):

#### 1. Hacer tu usuario Admin
**Necesito tu UID de Firebase Authentication**

Para obtenerlo:
1. Ve a: https://console.firebase.google.com/project/elite-forex-bot/authentication/users
2. Encuentra tu usuario (por email)
3. Copia el UID (string largo alfanumérico)
4. Pégalo aquí para que te haga admin automáticamente

#### 2. Configurar Cuentas Bancarias Reales
Actualmente en `system_settings` hay placeholders. Necesitas:
- Número de cuenta Banco Popular
- Número de cuenta BHD León (opcional)
- Nombre del titular de las cuentas

#### 3. Configurar Wallets Crypto
- Dirección USDT TRC20 (recomendado, fees bajos)
- Dirección USDT BEP20 (opcional)

#### 4. Deploy Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

## 🚀 Comandos para Ejecutar

### Setup Inicial:
```bash
cd /root/proyectos/elite-forex-dashboard/scripts
node setupFirebase.js
```

### Hacer Admin (necesito tu UID):
```bash
cd /root/proyectos/elite-forex-dashboard/scripts
node makeAdmin.js <TU_UID_AQUI>
```

## 📊 Estructura de Datos Creada

### Collections:
- `users/` - Usuarios registrados
- `investments/` - Inversiones activas
- `deposits/` - Depósitos (pendientes/aprobados)
- `withdrawals/` - Retiros solicitados
- `daily_profits/` - Ganancias distribuidas
- `system_settings/` - Configuración global
- `admin_logs/` - Logs de acciones admin

### Plans Configurados:
- **Básico**: $50 mínimo, 0.5% diario
- **Intermedio**: $200 mínimo, 0.85% diario
- **Premium**: $500 mínimo, 1.5% diario

### Schedule de Retiros:
- Días: Lunes, Miércoles, Viernes
- Horario: 9:00 AM - 5:00 PM (hora RD)

## 🔒 Security Rules

Las reglas de seguridad están configuradas en:
`/root/proyectos/elite-forex-dashboard/firestore.rules`

Características:
- Usuarios solo ven sus propios datos
- Solo admins pueden aprobar/rechazar
- Validación de campos obligatorios
- Protección contra escrituras no autorizadas

## 📱 URLs de la App

- **Landing**: https://elite-forex-dashboard.vercel.app
- **Login**: https://elite-forex-dashboard.vercel.app/login
- **Dashboard**: https://elite-forex-dashboard.vercel.app/dashboard
- **Admin**: https://elite-forex-dashboard.vercel.app/admin

## ⚠️ Notas Importantes

1. **Nunca compartas** el archivo `serviceAccountKey.json`
2. Las ganancias se distribuyen automáticamente a medianoche (hora RD)
3. Los retiros deben ser aprobados manualmente por admin
4. Los depósitos requieren comprobante (imagen) y aprobación

## 🆘 Soporte

Si hay algún error, revisa:
1. Firebase Console > Functions (logs)
2. Firebase Console > Firestore (datos)
3. Firebase Console > Storage (imágenes)
