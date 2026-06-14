import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, highlight }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-300 ${highlight ? 'border-blue-200 shadow-blue-50' : 'border-gray-100'
    }`}>
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

export default function Dashboard() {
  const { client, login } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newBooking, setNewBooking] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '');

  const fetchStats = useCallback(async (isInitial = false) => {
    try {
      const { data } = await api.get('/dashboard/stats');

      // New booking check karo
      if (stats && data.stats.today_bookings > stats.today_bookings) {
        setNewBooking(true);
        setTimeout(() => setNewBooking(false), 3000);
      }

      setStats(data.stats);
      setLastUpdated(new Date());
      if (isInitial) setLoading(false);
    } catch (err) {
      console.error(err);
      if (isInitial) setLoading(false);
    }
  }, [stats]);

  // Fresh profile load
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile');
      const token = localStorage.getItem('Veloxa_token');
      login(token, data.client);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchStats(true);
    fetchProfile();

    // Har 30 second mein auto refresh
    const interval = setInterval(() => {
      fetchStats(false);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const scriptTag = `<script src="${backendUrl}/widget.js?key=${client?.api_key}" data-api-key="${client?.api_key}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-8 mt-5">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Welcome back! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">{client?.business_name}</p>
        </div>
        {/* Last updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-300 mt-1">
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* New booking notification */}
      {newBooking && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 animate-pulse">
          <p className="text-green-600 font-medium text-sm">
            🎉 New booking received!
          </p>
        </div>
      )}

      {/* Plan warnings */}
      {!loading && stats?.days_left !== null && stats?.days_left !== undefined && (
        <>
          {stats.days_left <= 0 && (
            <div className="bg-red-100 border border-red-300 rounded-2xl p-4 mb-4">
              <p className="text-red-700 font-bold text-sm">
                🚫 Your plan has expired!
              </p>
              <p className="text-red-500 text-xs mt-1">
                Your AI assistant is inactive. Please renew your plan.
              </p>

              <a href="/#pricing"
                
                className="inline-block mt-2 text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-all"
              >
                Renew Now →
              </a>
            </div>
          )}
          {stats.days_left > 0 && stats.days_left <= 5 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
              <p className="text-orange-600 font-medium text-sm">
                ⚠️ Your {stats.plan} plan expires in {stats.days_left} day(s)!
              </p>
              <p className="text-orange-400 text-xs mt-1">
                Renew now to keep your AI assistant running.
              </p>
              <a href="/#pricing"
                
                className="inline-block mt-2 text-xs bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-all"
              >
                Upgrade Plan →
              </a>
            </div>
          )}
        </>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28 border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon="💬"
            label="Total Conversations"
            value={stats?.total_conversations || 0}
          />
          <StatCard
            icon="📅"
            label="Total Bookings"
            value={stats?.total_bookings || 0}
          />
          <StatCard
            icon="📆"
            label="Today's Bookings"
            value={stats?.today_bookings || 0}
            highlight={newBooking}
          />
          <StatCard
            icon="✉️"
            label="Messages Used"
            value={
              stats?.is_unlimited
                ? `${stats?.messages_used || 0} / ∞`
                : `${stats?.messages_used || 0} / ${stats?.messages_limit || 100}`
            }
          />
        </div>
      )}

      {/* Plan info bar */}
      {!loading && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Current Plan: <span className="text-blue-600">{stats?.plan?.toUpperCase()}</span>
            </p>
            {stats?.days_left > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {stats.days_left} days remaining
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Auto-refreshing</p>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto mt-1" />
          </div>
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
          className="w-full sm:w-auto text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
        >
          {copied ? '✅ Copied!' : '📋 Copy Code'}
        </button>
      </div>
    </div>
  );
}