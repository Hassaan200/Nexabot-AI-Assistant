import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/conversations')
      .then(({ data }) => setConversations(data.conversations))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openConversation = async (conv) => {
    setSelected(conv);
    const { data } = await api.get(`/dashboard/conversations/${conv.id}/messages`);
    setMessages(data.messages);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">💬 Conversations</h1>

      <div className="flex gap-6 h-[75vh]">

        {/* List */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-gray-400">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm">Koi conversation nahi</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all ${
                  selected?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    Session #{conv.id}
                  </p>
                  <span className="text-xs text-gray-300 ml-2 shrink-0">
                    {conv.message_count} msgs
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
                <p className="text-xs text-gray-300 mt-1">
                  {conv.last_message_at
                    ? new Date(conv.last_message_at).toLocaleString()
                    : '—'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-sm">Conversation select karo</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <p className="font-medium text-gray-700">Session #{selected.id}</p>
                <p className="text-xs text-gray-400">{selected.session_id}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}