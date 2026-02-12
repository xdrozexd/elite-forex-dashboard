import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.username} className="w-10 h-10 rounded-full border-2 border-primary" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-dark font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-400">Bienvenido</p>
            <p className="font-semibold text-white">@{user?.username || 'Demo'}</p>
          </div>
        </div>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};
