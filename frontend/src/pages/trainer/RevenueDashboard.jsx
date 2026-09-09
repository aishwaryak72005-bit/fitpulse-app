import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiEdit2, FiX } from 'react-icons/fi';

export const RevenueDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editFee, setEditFee] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments/');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (pId) => {
    try {
      await api.patch(`/payments/${pId}/`, { status: 'PAID' });
      fetchPayments();
    } catch (err) {
      alert('Error updating payment status');
    }
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/payments/${editingPayment.id}/`, { monthly_fee: editFee });
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      alert('Error updating monthly fee');
    }
  };

  const totalMonthlyRevenue = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.monthly_fee), 0);

  const paidCount = payments.filter((p) => p.status === 'PAID').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const overdueCount = payments.filter((p) => p.status === 'OVERDUE').length;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-extrabold text-white">Payment & Revenue Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Track monthly client subscriptions, renewals and pending dues</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400 uppercase">Monthly Revenue</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">₹{totalMonthlyRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400 uppercase">Paid Subscriptions</span>
          <p className="text-2xl font-extrabold text-white mt-1">{paidCount}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400 uppercase">Pending Payments</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400 uppercase">Overdue Payments</span>
          <p className="text-2xl font-extrabold text-red-400 mt-1">{overdueCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-bold text-white text-base">Client Subscription Records</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/60 text-xs uppercase text-gray-400 border-b border-gray-700">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Client Name</th>
              <th className="py-3.5 px-4 font-semibold">Monthly Fee</th>
              <th className="py-3.5 px-4 font-semibold">Due Date</th>
              <th className="py-3.5 px-4 font-semibold">Renewal Date</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-emerald-400">Loading payments...</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">No payment records found.</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-700/30">
                  <td className="py-3.5 px-4 font-bold text-white">{p.client_name}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">₹{p.monthly_fee}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{p.due_date}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{p.renewal_date}</td>
                  <td className="py-3.5 px-4">
                    {p.status === 'PAID' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Paid
                      </span>
                    )}
                    {p.status === 'PENDING' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                        Pending
                      </span>
                    )}
                    {p.status === 'OVERDUE' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingPayment(p);
                        setEditFee(p.monthly_fee);
                      }}
                      className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-xs rounded-lg transition inline-flex items-center"
                      title="Edit Monthly Fee"
                    >
                      <FiEdit2 className="mr-1" /> Edit Fee
                    </button>
                    {p.status !== 'PAID' && (
                      <button
                        onClick={() => markPaid(p.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT FEE MODAL */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-bold text-white">Edit Client Monthly Fee</h3>
              <button onClick={() => setEditingPayment(null)} className="text-gray-400 hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateFee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Client: <span className="text-white font-bold">{editingPayment.client_name}</span>
                </label>
                <div className="mt-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Monthly Package Fee (₹)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2.5 rounded-xl text-white font-bold text-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
                    placeholder="3000"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30"
                >
                  Update Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
