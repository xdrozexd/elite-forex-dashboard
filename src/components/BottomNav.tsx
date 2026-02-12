interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface BottomNavProps {
  items: NavItem[];
}

export const BottomNav = ({ items }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-sm border-t border-gray-800">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              item.active ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className={item.active ? 'text-primary' : 'text-gray-400'}>
              {item.icon}
            </div>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
