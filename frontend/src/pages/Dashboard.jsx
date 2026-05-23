import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

export default function Dashboard() {
  const { client } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scriptTag = `<script src="${backendUrl}/widget.js?key=${client?.api_key}" data-api-key="${client?.api_key}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
          Welcome back! 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">{client?.business_name}</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28 border border-gray-100"/>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon="💬" label="Total Conversations" value={stats?.total_conversations || 0} />
          <StatCard icon="📅" label="Total Bookings" value={stats?.total_bookings || 0} />
          <StatCard icon="📆" label="Today's Bookings" value={stats?.today_bookings || 0} />
          <StatCard icon="✉️" label="Messages Used" value={`${stats?.messages_used || 0}/${stats?.messages_limit || 100}`} />
        </div>
      )}

      {/* Widget Code */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
          🔌 <span>Embed on your website</span>
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Copy this code and paste before closing &lt;/body&gt; tag
        </p>
        <div className="bg-gray-900 rounded-xl p-3 overflow-x-auto mb-3">
          <code className="text-green-400 text-xs whitespace-nowrap">
            {scriptTag}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all"
        >
          {copied ? '✅ Copied!' : '📋 Copy Code'}
        </button>
      </div>
    </div>
  );
}