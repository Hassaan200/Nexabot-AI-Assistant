import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <span className="font-bold text-gray-800">Veloxa</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-all"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-100 h-screen overflow-hidden
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo — desktop only */}
        <div className="hidden lg:block p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">Veloxa</p>
              <p className="text-xs text-gray-400 truncate max-w-[140px]">
                {client?.business_name}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile header inside sidebar */}
        <div className="lg:hidden p-4 border-b border-gray-100">
          <p className="font-bold text-gray-800">{client?.business_name}</p>
          <p className="text-xs text-gray-400">{client?.email}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Plan + Logout */}
        <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="bg-blue-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-blue-600 font-medium">
              Plan: {client?.plan?.toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {client?.plan === 'trial' ? '7 day free trial' : 'Active subscription'}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}