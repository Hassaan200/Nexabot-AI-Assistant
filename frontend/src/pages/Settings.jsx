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
        api.get('/dashboard/stats')
            .then(({ data }) => setStatsData(data.stats))
            .catch(console.error);
    }, []);

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
            const token = localStorage.getItem('Veloxa_token');
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
                        Bot Name
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
                        Bot Color
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
                        Bot Instructions
                    </label>

                    {/* Warning Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                        <div className="flex items-start gap-3">
                            <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
                            <div>
                                <p className="text-sm font-semibold text-amber-700 mb-1">
                                    Important — Please Read Before Editing
                                </p>
                                <p className="text-xs text-amber-600 leading-relaxed">
                                    The instructions already written here control your bot's booking, rescheduling, 
                                    and cancellation system. <strong>Do not delete or replace them.</strong>
                                    <br /><br />
                                    ✅ <strong>Correct way:</strong> Add your business details <em>below</em> the existing text.<br />
                                    ❌ <strong>Wrong way:</strong> Deleting everything and writing from scratch.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How to add info */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2">
                            📝 How to add your business details:
                        </p>
                        <div className="bg-white rounded-lg px-3 py-2 font-mono text-xs text-gray-500 leading-relaxed border border-blue-100">
                            <span className="text-gray-300">{`--- existing instructions above ---`}</span>
                            <br /><br />
                            <span className="text-blue-600">--- MY BUSINESS INFO ---</span><br />
                            Business: My Clinic, Karachi<br />
                            Timings: Mon–Sat 10AM to 8PM, Sunday closed<br />
                            Services: Checkup Rs.500, X-ray Rs.1500<br />
                            Contact: 0300-1234567
                        </div>
                    </div>

                    <textarea
                        rows={10}
                        value={form.system_prompt}
                        onChange={e => setForm({ ...form, system_prompt: e.target.value })}
                        placeholder={`Your bot instructions will appear here...`}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none font-mono"
                    />

                    <p className="text-xs text-gray-400 mt-1">
                        💡 Scroll up in the text box to see existing instructions, then add your details at the bottom.
                    </p>
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
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                    {loading ? 'Saving...' : saved ? '✅ Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}