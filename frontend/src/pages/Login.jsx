import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    email: '',
    password: '',
    business_type: 'clinic',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : {
        email: form.email,
        password: form.password
      };
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.client);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Kuch masla hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🤖</div>
          <h1 className="text-2xl font-bold text-gray-800">NexaBot</h1>
          <p className="text-gray-500 text-sm mt-1">AI Assistant Platform</p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isRegister ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isRegister ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Business name"
                value={form.business_name}
                onChange={e => setForm({ ...form, business_name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <select
                value={form.business_type}
                onChange={e => setForm({ ...form, business_type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                <option value="clinic">Clinic / Hospital</option>
                <option value="restaurant">Restaurant</option>
                <option value="salon">Salon / Beauty</option>
                <option value="general">General Business</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400"
          />

          {/* Password with show/hide */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Forgot password — sirf login pe */}
          {!isRegister && (
            <div className="text-right">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}