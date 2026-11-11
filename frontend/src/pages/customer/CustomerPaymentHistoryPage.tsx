import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { PaymentResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Receipt, CheckCircle2, CreditCard, Eye, ShieldCheck, Download } from 'lucide-react';

export const CustomerPaymentHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    customerService
      .getMyPayments(user?.email)
      .then(setPayments)
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user, showError]);

  const totalPaid = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit of all confirmed rental transactions and downloadable receipts
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-500">Total Spent:</span>
          <span className="font-black text-slate-900 text-sm">${totalPaid}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 mt-3">Loading payment records...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No payment records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When your car bookings are approved and paid for, your transaction details will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">{p.transactionId}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{p.carName}</td>
                    <td className="px-5 py-4 font-black text-slate-900">${p.amount}</td>
                    <td className="px-5 py-4 font-medium uppercase text-slate-600">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        title="Official Payment Receipt"
        maxWidth="lg"
      >
        {selectedReceipt && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  EasyCarRent Receipt
                </span>
                <h3 className="text-xl font-black text-slate-900">{selectedReceipt.transactionId}</h3>
              </div>
              <StatusBadge status={selectedReceipt.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Customer Name</span>
                <p className="font-semibold text-slate-900">{selectedReceipt.customerName}</p>
                <p className="text-slate-500 text-[11px]">{selectedReceipt.customerEmail}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Rented Vehicle</span>
                <p className="font-semibold text-slate-900">{selectedReceipt.carName}</p>
                <p className="text-slate-500 text-[11px]">Booking #{selectedReceipt.bookingId}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Payment Method</span>
                <p className="font-semibold text-slate-900">{selectedReceipt.paymentMethod.replace('_', ' ')}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Timestamp</span>
                <p className="font-semibold text-slate-900">
                  {new Date(selectedReceipt.paidAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm">Total Paid Amount:</span>
              <span className="text-2xl font-black text-emerald-700">${selectedReceipt.amount}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
