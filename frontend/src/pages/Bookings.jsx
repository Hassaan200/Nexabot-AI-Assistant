import { useState, useEffect } from 'react';
import api from '../api/axios';

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-blue-100 text-blue-700',
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = filter
        ? `/dashboard/bookings?status=${filter}`
        : '/dashboard/bookings';
      const { data } = await api.get(url);
      setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/dashboard/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800">📅 Bookings</h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-32 border border-gray-100"/>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-sm">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {b.customer_name || 'Unknown'}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                  </div>

                  {(b.booking_date || b.booking_time) && (
                    <p className="text-sm text-gray-500">
                      {b.booking_date && `📅 ${b.booking_date}`}
                      {b.booking_date && b.booking_time && ' — '}
                      {b.booking_time && `⏰ ${b.booking_time}`}
                    </p>
                  )}

                  {b.customer_phone && (
                    <p className="text-sm text-gray-500 mt-1">
                      📞 {b.customer_phone}
                    </p>
                  )}

                  {b.notes && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-medium text-gray-400 mb-1">📋 Details</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{b.notes}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-300 mt-2">
                    {new Date(b.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  {b.status !== 'confirmed' && (
                    <button
                      onClick={() => updateStatus(b.id, 'confirmed')}
                      className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 whitespace-nowrap"
                    >
                      ✓ Confirm
                    </button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 whitespace-nowrap"
                    >
                      ✗ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}