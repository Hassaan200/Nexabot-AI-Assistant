import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Settings() {
  const { client } = useAuth();
  const [form, setForm] = useState({
    widget_name: client?.widget_name || '',
    widget_color: client?.widget_color || '#2563eb',
    system_prompt: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await api.put('/auth/settings', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
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
            Bot ki instructions (System Prompt)
          </label>
          <textarea
            rows={6}
            value={form.system_prompt}
            onChange={e => setForm({ ...form, system_prompt: e.target.value })}
            placeholder="Apne business ki information yahan likhein..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none"
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs font-mono text-gray-500 break-all">
            {client?.api_key}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
        >
          {saved ? '✅ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}