import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiCreditCard, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

export const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPayments();
  }, []);

  const fetchMyPayments = async () => {
    try {
      const res = await api.get('/payments/');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-emerald-400 font-semibold">Loading Subscription Info...</div>;
  }

  const latestPayment = payments[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-extrabold text-white">My Gym Subscription & Payments</h1>
        <p className="text-sm text-gray-400 mt-1">View personal subscription plan, status & renewal dates</p>
      </div>

      {latestPayment && (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h3 className="font-bold text-white text-lg">Current Membership Plan</h3>
            {latestPayment.status === 'PAID' && (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-full">
                🟢 Paid & Active
              </span>
            )}
            {latestPayment.status === 'PENDING' && (
              <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold rounded-full">
                🟡 Payment Pending
              </span>
            )}
            {latestPayment.status === 'OVERDUE' && (
              <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-800 text-xs font-bold rounded-full">
                🔴 Payment Overdue
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-400 font-semibold uppercase">Monthly Fee</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">₹{latestPayment.monthly_fee}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-400 font-semibold uppercase">Due Date</span>
              <p className="text-lg font-bold text-white mt-1 font-mono">{latestPayment.due_date}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-400 font-semibold uppercase">Next Renewal Date</span>
              <p className="text-lg font-bold text-white mt-1 font-mono">{latestPayment.renewal_date}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-bold text-white text-base">Payment History Log</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/60 text-xs uppercase text-gray-400 border-b border-gray-700">
            <tr>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Due Date</th>
              <th className="py-3 px-4 font-semibold">Renewal Date</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/60">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">No payment history found.</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-700/30">
                  <td className="py-3.5 px-4 font-bold text-emerald-400">₹{p.monthly_fee}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-300">{p.due_date}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-300">{p.renewal_date}</td>
                  <td className="py-3.5 px-4 font-bold text-xs">
                    {p.status === 'PAID' && <span className="text-emerald-400">Paid</span>}
                    {p.status === 'PENDING' && <span className="text-amber-400">Pending</span>}
                    {p.status === 'OVERDUE' && <span className="text-red-400">Overdue</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
