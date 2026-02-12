import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { BalanceCard } from '../components/BalanceCard';
import { GrowthChart } from '../components/GrowthChart';
import { WithdrawalForm } from '../components/WithdrawalForm';
import { ReferralSection } from '../components/ReferralSection';
import { SideMenu } from '../components/SideMenu';
import { BottomNav } from '../components/BottomNav';
import { Disclaimer } from '../components/Disclaimer';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { withdrawals, currentPlan } = useApp();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: '🏠', label: 'Inicio', onClick: () => { setActiveTab('inicio'); setMenuOpen(false); } },
    { icon: '📜', label: 'Historial', onClick: () => { setActiveTab('historial'); setMenuOpen(false); } },
    { icon: '💰', label: 'Retiros', onClick: () => { setActiveTab('retiros'); setMenuOpen(false); } },
    { icon: '🎁', label: 'Referidos', onClick: () => { setActiveTab('referidos'); setMenuOpen(false); } },
    { icon: '⚙️', label: 'Configuración', onClick: () => { setActiveTab('config'); setMenuOpen(false); } },
    { icon: '💬', label: 'Soporte', onClick: () => { setActiveTab('soporte'); setMenuOpen(false); } },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="space-y-4">
            <BalanceCard />
            <GrowthChart />
            {!currentPlan && (
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
                <p className="text-gold text-sm font-semibold mb-2">⚠️ Sin plan activo</p>
                <p className="text-gray-400 text-sm mb-3">
                  Para comenzar a ganar, selecciona uno de nuestros planes
                </p>
                <button
                  onClick={() => navigate('/plans')}
                  className="w-full py-2 bg-gold hover:bg-yellow-400 rounded-lg font-bold text-dark transition-colors"
                >
                  Ver Planes
                </button>
              </div>
            )}
          </div>
        );
      case 'historial':
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">📜 Historial de Actividad</h3>
              <div className="space-y-3">
                {[
                  { date: '10/01/2024', desc: 'Ganancia diaria +0.5%', amount: '$0.50', positive: true },
                  { date: '09/01/2024', desc: 'Ganancia diaria +1.5%', amount: '$1.50', positive: true },
                  { date: '08/01/2024', desc: 'Ganancia diaria +0.85%', amount: '$0.85', positive: true },
                  { date: '07/01/2024', desc: 'Retiro procesado', amount: '-$75.00', positive: false },
                  { date: '06/01/2024', desc: 'Ganancia diaria +0.5%', amount: '$0.50', positive: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-dark rounded-xl">
                    <div>
                      <p className="text-sm text-white">{item.desc}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <span className={`font-bold ${item.positive ? 'text-primary' : 'text-red-400'}`}>
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'retiros':
        return (
          <div className="space-y-4">
            <WithdrawalForm />
            <div className="bg-gray-800/50 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">📋 Historial de Retiros</h3>
              <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-dark rounded-xl">
                    <div>
                      <p className="text-sm text-white">Retiro #{withdrawal.id}</p>
                      <p className="text-xs text-gray-500">{withdrawal.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">-${withdrawal.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {withdrawal.status === 'approved' ? 'Aprobado' : withdrawal.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'referidos':
        return (
          <div className="space-y-4">
            <ReferralSection />
            <div className="bg-gray-800/50 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">👥 Tus Referidos</h3>
              <div className="space-y-3">
                {[
                  { user: '@john_trader', date: '05/01/2024', earnings: 15 },
                  { user: '@maria_invests', date: '03/01/2024', earnings: 15 },
                  { user: '@crypto_king', date: '01/01/2024', earnings: 15 },
                ].map((ref, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-dark rounded-xl">
                    <div>
                      <p className="text-sm text-white">{ref.user}</p>
                      <p className="text-xs text-gray-500">{ref.date}</p>
                    </div>
                    <span className="text-primary font-bold">+${ref.earnings}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'config':
        return (
          <div className="bg-gray-800/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">⚙️ Configuración</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-dark rounded-xl text-left">
                <span className="text-white">🔔 Notificaciones</span>
                <span className="w-10 h-6 bg-primary rounded-full relative">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-dark rounded-full"></span>
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-dark rounded-xl text-left">
                <span className="text-white">🌙 Modo oscuro</span>
                <span className="w-10 h-6 bg-primary rounded-full relative">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-dark rounded-full"></span>
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-dark rounded-xl text-left">
                <span className="text-white">🔒 Cambiar contraseña</span>
                <span className="text-gray-500">→</span>
              </button>
            </div>
          </div>
        );
      case 'soporte':
        return (
          <div className="bg-gray-800/50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">💬 Soporte</h3>
            <div className="space-y-4">
              <a href="#" className="block p-4 bg-dark rounded-xl hover:bg-gray-700 transition-colors">
                <p className="text-white font-semibold">💬 Chat en vivo</p>
                <p className="text-sm text-gray-400">Habla con nuestro equipo</p>
              </a>
              <a href="#" className="block p-4 bg-dark rounded-xl hover:bg-gray-700 transition-colors">
                <p className="text-white font-semibold">📧 Email</p>
                <p className="text-sm text-gray-400">support@eliteforex.com</p>
              </a>
              <a href="#" className="block p-4 bg-dark rounded-xl hover:bg-gray-700 transition-colors">
                <p className="text-white font-semibold">📖 FAQ</p>
                <p className="text-sm text-gray-400">Preguntas frecuentes</p>
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark pb-20">
      <Header onMenuClick={() => setMenuOpen(true)} />

      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Salir
      </button>

      <main className="max-w-md mx-auto px-4 pt-24">
        {renderContent()}

        {activeTab === 'inicio' && <Disclaimer />}
      </main>

      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.label.toLowerCase()
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          <div className="border-t border-gray-700 mt-4 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </SideMenu>

      <div className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-sm border-t border-gray-800 pb-safe">
        <div className="max-w-md mx-auto">
          <BottomNav
            items={[
              { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>, label: 'Inicio', active: activeTab === 'inicio', onClick: () => setActiveTab('inicio') },
              { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>, label: 'Historial', active: activeTab === 'historial', onClick: () => setActiveTab('historial') },
              { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>, label: 'Retiros', active: activeTab === 'retiros', onClick: () => setActiveTab('retiros') },
              { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>, label: 'Referidos', active: activeTab === 'referidos', onClick: () => setActiveTab('referidos') },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
