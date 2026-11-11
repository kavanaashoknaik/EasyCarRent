import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { CustomerResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  User,
  Phone,
} from 'lucide-react';

export const AdminLicenseVerification: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const loadPending = () => {
    setLoading(true);
    // Fetch all customers, then filter or prioritize PENDING
    adminService
      .getCustomers()
      .then((data) => {
        setCustomers(data);
      })
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleReview = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      const res = await adminService.reviewLicense(id, status);
      showSuccess(`Licence marked as ${status} for ${res.fullName}`);
      setSelectedCustomer(null);
      loadPending();
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const pendingList = customers.filter((c) => c.licenseStatus === 'PENDING');
  const otherList = customers.filter(
    (c) => c.licenseUploaded && c.licenseStatus !== 'PENDING'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            Compliance & Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Driving Licence Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review uploaded driving licence photos & PDFs to verify driver eligibility
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
          <Clock className="w-4 h-4" />
          <span>{pendingList.length} Pending Review</span>
        </div>
      </div>

      {/* Pending Queue Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Pending Submissions ({pendingList.length})
        </h3>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-3">Loading verification queue...</p>
          </div>
        ) : pendingList.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-slate-200">All caught up!</p>
            <p>No driving licences are currently waiting for verification.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingList.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center">
                      {c.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{c.fullName}</h4>
                      <span className="text-[11px] text-slate-400">{c.email}</span>
                    </div>
                  </div>
                  <StatusBadge status="PENDING" size="sm" />
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Licence Number:</span>
                    <span className="font-mono font-bold text-white">{c.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-200 font-mono">{c.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    Inspect & Review
                  </button>
                  <button
                    onClick={() => handleReview(c.id, 'VERIFIED')}
                    disabled={actionLoading}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    title="Quick Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReview(c.id, 'REJECTED')}
                    disabled={actionLoading}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                    title="Quick Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previously Reviewed Submissions */}
      <div className="space-y-3 pt-6 border-t border-slate-800">
        <h3 className="font-bold text-sm text-white">
          Verification History ({otherList.length})
        </h3>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Licence Number</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {otherList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-white">{c.fullName}</td>
                    <td className="px-5 py-4 font-mono">{c.licenseNumber}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.licenseStatus} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title="Inspect Driving Licence Document"
        maxWidth="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-base text-slate-900">{selectedCustomer.fullName}</h4>
                <p className="text-xs text-slate-500 font-mono">
                  Licence: {selectedCustomer.licenseNumber}
                </p>
              </div>
              <StatusBadge status={selectedCustomer.licenseStatus} size="md" />
            </div>

            {/* Document preview container */}
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-center text-slate-300 space-y-3">
              <div className="max-h-64 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
                  alt="Licence preview"
                  className="w-full h-56 object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-xs px-1">
                <span>Document verified via Spring Boot FileStorage</span>
                <a
                  href={adminService.getLicenseFileUrl(selectedCustomer.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Raw File
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Decision Action
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleReview(selectedCustomer.id, 'VERIFIED')}
                  disabled={actionLoading}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve (VERIFIED)
                </button>
                <button
                  onClick={() => handleReview(selectedCustomer.id, 'REJECTED')}
                  disabled={actionLoading}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject (REJECTED)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
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
