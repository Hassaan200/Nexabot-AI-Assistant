import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className={`text-3xl mb-3`}>{icon}</div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-400 mt-1">{label}</p>
  </div>
);

export default function Dashboard() {
  const { client } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back! 👋
        </h1>
        <p className="text-gray-400 mt-1">{client?.business_name}</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard icon="💬" label="Total Conversations" value={stats?.total_conversations || 0} />
          <StatCard icon="📅" label="Total Bookings" value={stats?.total_bookings || 0} />
          <StatCard icon="📆" label="Today's Bookings" value={stats?.today_bookings || 0} />
          <StatCard icon="✉️" label="Total Messages" value={stats?.total_messages || 0} />
        </div>
      )}

      {/* Widget Code */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-2">
          🔌 Apni website pe lagao
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Yeh code copy karo aur apni website ki body closing tag se pehle paste karo
        </p>
        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <code className="text-green-400 text-xs whitespace-nowrap">
            {`<script src="http://localhost:3000/widget.js?key=${client?.api_key}" data-api-key="${client?.api_key}"></script>`}
          </code>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `<script src="http://localhost:3000/widget.js?key=${client?.api_key}" data-api-key="${client?.api_key}"></script>`
            );
            alert('Code copy ho gaya!');
          }}
          className="mt-3 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          📋 Copy Code
        </button>
      </div>
    </div>
  );
}