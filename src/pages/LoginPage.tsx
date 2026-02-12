import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'basic'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) return 'Username es requerido';
    if (!formData.email.trim()) return 'Email es requerido';
    if (!formData.email.includes('@')) return 'Email inválido';
    if (!formData.password) return 'Contraseña es requerida';
    if (formData.password.length < 6) return 'Mínimo 6 caracteres';
    if (!isLogin && formData.password !== formData.confirmPassword) return 'Contraseñas no coinciden';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    login({
      username: formData.username,
      email: formData.email,
      plan: formData.plan
    });

    navigate('/dashboard');
  };

  const handleTelegramLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    login({
      username: 'telegram_user',
      email: 'user@telegram.com',
      plan: 'basic'
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-green-600 mb-4 shadow-lg shadow-primary/25">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Elite Forex</h1>
          <p className="text-gray-400">Tu puerta al éxito financiero</p>
        </div>

        <div className="flex bg-gray-800/50 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              isLogin 
                ? 'bg-primary text-dark shadow-lg shadow-primary/25' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              !isLogin 
                ? 'bg-primary text-dark shadow-lg shadow-primary/25' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">👤</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Tu username"
                  className="w-full px-12 py-4 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="w-full px-12 py-4 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Contraseña</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔒</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-12 py-4 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirmar Contraseña</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔐</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-12 py-4 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Plan</label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-dark border border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none transition-all"
                >
                  <option value="basic">Básico - $50 (0.5%/día)</option>
                  <option value="intermediate">Intermedio - $200 (0.85%/día)</option>
                  <option value="premium">Premium - $500 (1.5%/día)</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-green-500 hover:from-green-500 hover:to-green-600 disabled:opacity-50 rounded-xl font-bold text-dark text-lg shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">o continúa con</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <button
            onClick={handleTelegramLogin}
            className="w-full py-4 bg-[#229ED9] hover:bg-[#1e88c7] rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.696.065-1.225-.46-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Continuar con Telegram
          </button>

          {!isLogin && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-primary hover:underline">Términos de Servicio</a>
              {' '}y{' '}
              <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
            </p>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 Elite Forex. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
