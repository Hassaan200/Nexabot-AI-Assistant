import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/bookings', icon: '📅', label: 'Bookings' },
  { to: '/conversations', icon: '💬', label: 'Conversations' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  const { client, logout } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div>
            <p className="font-bold text-gray-800">NexaBot</p>
            <p className="text-xs text-gray-400 truncate max-w-[140px]">
              {client?.business_name}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Plan badge + Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-blue-50 rounded-xl p-3 mb-3">
          <p className="text-xs text-blue-600 font-medium">
            Plan: {client?.plan?.toUpperCase()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Trial ends soon
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}