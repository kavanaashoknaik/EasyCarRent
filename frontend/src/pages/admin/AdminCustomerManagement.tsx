import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { CustomerResponse, LicenseStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

export const AdminCustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState<CustomerResponse | null>(null);
  const { showSuccess, showError } = useNotification();

  const loadCustomers = () => {
    setLoading(true);
    adminService
      .getCustomers(selectedStatus ? (selectedStatus as LicenseStatus) : undefined)
      .then(setCustomers)
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [selectedStatus]);

  const handleReviewLicense = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const updated = await adminService.reviewLicense(id, status);
      showSuccess(`Licence marked as ${status} for ${updated.fullName}`);
      if (viewCustomer && viewCustomer.id === id) {
        setViewCustomer(updated);
      }
      loadCustomers();
    } catch (err: any) {
      showError(getErrorMessage(err));
    }
  };

  const filtered = customers.filter((c) =>
    `${c.fullName} ${c.email} ${c.phone} ${c.licenseNumber || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            User Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Customer Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit registered customer profiles, contact info, and driving licence credentials
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
          >
            <option value="">All Licence Statuses</option>
            <option value="PENDING">PENDING Verification</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="NOT_UPLOADED">NOT UPLOADED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Total Customers: <strong className="text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Loading customer records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No customers found</h3>
          <p className="text-xs text-slate-500">
            {selectedStatus ? `No customers with licence status "${selectedStatus}".` : 'No registered customer accounts.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Licence Number</th>
                  <th className="px-5 py-3.5">Licence Status</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                          {c.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{c.fullName}</span>
                          <span className="text-[11px] text-slate-400">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-300">{c.phone}</td>
                    <td className="px-5 py-4">
                      {c.licenseNumber ? (
                        <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-200 border border-slate-800">
                          {c.licenseNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.licenseStatus} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {c.registeredAt ? new Date(c.registeredAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setViewCustomer(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
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

      {/* Customer Detail Modal */}
      <Modal
        isOpen={Boolean(viewCustomer)}
        onClose={() => setViewCustomer(null)}
        title="Customer Profile & Licence"
        maxWidth="lg"
      >
        {viewCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {viewCustomer.fullName[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{viewCustomer.fullName}</h3>
                <p className="text-xs text-slate-500">{viewCustomer.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={viewCustomer.licenseStatus} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Phone Number
                </span>
                <p className="font-semibold text-slate-900">{viewCustomer.phone}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Licence ID
                </span>
                <p className="font-mono font-bold text-slate-900">
                  {viewCustomer.licenseNumber || 'Not submitted'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 col-span-2">
                <span className="font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Residential Address
                </span>
                <p className="text-slate-700">
                  {viewCustomer.address || 'No address registered by user.'}
                </p>
              </div>
            </div>

            {/* Quick verification action inside modal */}
            {viewCustomer.licenseUploaded && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Review Licence Action
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReviewLicense(viewCustomer.id, 'VERIFIED')}
                    disabled={viewCustomer.licenseStatus === 'VERIFIED'}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve (VERIFIED)
                  </button>
                  <button
                    onClick={() => handleReviewLicense(viewCustomer.id, 'REJECTED')}
                    disabled={viewCustomer.licenseStatus === 'REJECTED'}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject (REJECTED)
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setViewCustomer(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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
