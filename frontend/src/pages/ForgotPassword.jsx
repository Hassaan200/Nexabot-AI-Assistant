import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Kuch masla hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <button
          onClick={() => navigate('/login')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
        >
          ← Back to Login
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="text-gray-400 text-sm mt-2">
            Apni email daalo — reset link bhej denge
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-green-600 font-medium mb-2">
              Reset link bhej diya gaya!
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Apni email check karein aur reset link pe click karein.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Registered email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-400"
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}