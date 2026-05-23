import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Settings() {
    const { client, login } = useAuth();
    const [form, setForm] = useState({
        widget_name: '',
        widget_color: '#2563eb',
        system_prompt: '',
    });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statsData, setStatsData] = useState(null);

    useEffect(() => {
  // Fresh stats lo
  api.get('/dashboard/stats')
    .then(({ data }) => setStatsData(data.stats))
    .catch(console.error);
}, []);

    // Client data load karo
    useEffect(() => {
        if (client) {
            setForm({
                widget_name: client.widget_name || '',
                widget_color: client.widget_color || '#2563eb',
                system_prompt: client.system_prompt || '',
            });
        }
    }, [client]);

    const handleSave = async () => {
        setError('');
        setLoading(true);
        try {
            const { data } = await api.put('/auth/settings', form);

            // Auth context update karo — widget turant reflect hoga
            const token = localStorage.getItem('nexabot_token');
            login(token, { ...client, ...data.client });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Kuch masla hua');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

                {/* Widget Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bot ka naam
                    </label>
                    <input
                        type="text"
                        value={form.widget_name}
                        onChange={e => setForm({ ...form, widget_name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
                    />
                </div>

                {/* Widget Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bot ka color
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            value={form.widget_color}
                            onChange={e => setForm({ ...form, widget_color: e.target.value })}
                            className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200"
                        />
                        <span className="text-sm text-gray-400">{form.widget_color}</span>
                    </div>
                </div>

                {/* System Prompt */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bot ki instructions
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                        Apne business ki poori info likhein — timings, services, prices, address
                    </p>
                    <textarea
                        rows={8}
                        value={form.system_prompt}
                        onChange={e => setForm({ ...form, system_prompt: e.target.value })}
                        placeholder={`Example:
You are assistant for My Clinic.
Timings: Mon-Sat 10AM-8PM, Sunday closed.
Services: Checkup Rs.500, Xray Rs.1500
Address: Main Road, Lahore
Phone: 0300-1234567`}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none font-mono"
                    />
                </div>

                {/* Plan info */}
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-blue-700">
                        Current Plan: {client?.plan?.toUpperCase()}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                        Messages: {statsData?.messages_used || 0} / {statsData?.messages_limit || 100} used
                    </p>
                </div>

                {/* API Key */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your API Key
                    </label>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs font-mono text-gray-500 break-all">
                        {client?.api_key}
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        {error}
                    </p>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {loading ? 'Saving...' : saved ? '✅ Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}