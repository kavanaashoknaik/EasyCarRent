import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { PaymentResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Receipt,
  Search,
  DollarSign,
  CreditCard,
  Eye,
  CheckCircle,
  Download,
} from 'lucide-react';

export const AdminPaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  const { showError } = useNotification();

  useEffect(() => {
    adminService
      .getPayments()
      .then(setPayments)
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [showError]);

  const totalCollected = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const filtered = payments.filter((p) =>
    `${p.transactionId} ${p.customerName} ${p.customerEmail} ${p.carName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            Financial Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Payment Audit & Transactions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit all rental transactions, payments, methods, and customer billing records
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-md flex items-center gap-3 self-start sm:self-auto">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-400">Total Revenue:</span>
          <span className="font-black text-emerald-400 text-sm">${totalCollected}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search txn ID, customer, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs text-slate-400">
          Total Records: <strong className="text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Loading transactions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No payment records found</h3>
          <p className="text-xs text-slate-500">
            Transactions will appear once approved customer bookings are paid for.
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Rented Car</th>
                  <th className="px-5 py-3.5">Booking #</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-white">{p.transactionId}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-white block">{p.customerName}</span>
                      <span className="text-[11px] text-slate-400">{p.customerEmail}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-200">{p.carName}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-slate-400">
                      #{p.bookingId}
                    </td>
                    <td className="px-5 py-4 font-black text-emerald-400 text-sm">${p.amount}</td>
                    <td className="px-5 py-4 uppercase font-semibold text-slate-300">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Audit Modal */}
      <Modal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        title="Transaction Audit Record"
        maxWidth="lg"
      >
        {selectedPayment && (
          <div className="space-y-6 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Transaction Audit Ref
                </span>
                <h4 className="font-mono font-bold text-base text-slate-900">
                  {selectedPayment.transactionId}
                </h4>
              </div>
              <StatusBadge status={selectedPayment.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Customer Information</span>
                <p className="font-semibold text-slate-900 text-sm">{selectedPayment.customerName}</p>
                <p className="text-slate-500 font-mono">{selectedPayment.customerEmail}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Rented Fleet Vehicle</span>
                <p className="font-semibold text-slate-900 text-sm">{selectedPayment.carName}</p>
                <p className="text-slate-500 font-mono">Linked Booking #{selectedPayment.bookingId}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Payment Channel</span>
                <p className="font-semibold text-slate-900 text-sm">
                  {selectedPayment.paymentMethod.replace('_', ' ')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Execution Timestamp</span>
                <p className="font-semibold text-slate-900 text-sm">
                  {new Date(selectedPayment.paidAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm">Settled Revenue Amount:</span>
              <span className="text-2xl font-black text-emerald-700">${selectedPayment.amount}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Print Statement
              </button>
              <button
                onClick={() => setSelectedPayment(null)}
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
