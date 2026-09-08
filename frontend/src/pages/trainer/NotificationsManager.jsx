import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiSend, FiUsers, FiCheckCircle } from 'react-icons/fi';

export const NotificationsManager = () => {
  const [clients, setClients] = useState([]);
  const [targetType, setTargetType] = useState('ALL');
  const [receiverId, setReceiverId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients/');
      setClients(res.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setLoading(true);
    try {
      if (targetType === 'ALL') {
        await api.post('/notifications/broadcast/', {
          broadcast_all: true,
          title: title || 'Trainer Motivation 🔥',
          message: message
        });
        setStatusMsg('Successfully broadcasted notification to all clients!');
      } else {
        const clientObj = clients.find((c) => c.id === parseInt(receiverId));
        await api.post('/notifications/broadcast/', {
          receiver_id: clientObj.user.id,
          title: title || 'Personal Notice from Trainer',
          message: message
        });
        setStatusMsg(`Successfully sent notification to ${clientObj.full_name}!`);
      }
      setTitle('');
      setMessage('');
    } catch (err) {
      alert('Error sending notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-extrabold text-white">Broadcast & Custom Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">Send workout reminders, daily motivation or custom updates to clients</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
        {statusMsg && (
          <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-3 rounded-xl flex items-center text-sm">
            <FiCheckCircle className="mr-2 w-5 h-5 flex-shrink-0" />
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Target Audience</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value="ALL"
                  checked={targetType === 'ALL'}
                  onChange={() => setTargetType('ALL')}
                  className="text-emerald-500"
                />
                <span>All Clients (Broadcast)</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value="SINGLE"
                  checked={targetType === 'SINGLE'}
                  onChange={() => setTargetType('SINGLE')}
                  className="text-emerald-500"
                />
                <span>Individual Client</span>
              </label>
            </div>
          </div>

          {targetType === 'SINGLE' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Select Client</label>
              <select
                required
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Notification Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Daily Morning Motivation 🔥"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Message Content</label>
            <textarea
              required
              rows={4}
              placeholder="Type your motivational message or workout reminder here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30 flex items-center justify-center"
          >
            <FiSend className="mr-2" /> {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
};
