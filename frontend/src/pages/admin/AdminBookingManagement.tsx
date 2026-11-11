import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import {
  BookingResponse,
  BookingStatus,
  CarResponse,
} from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  CalendarDays,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  CheckSquare,
  AlertCircle,
  Eye,
  MessageSquare,
} from 'lucide-react';

export const AdminBookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useNotification();

  // Approve Modal state
  const [approvingBooking, setApprovingBooking] = useState<BookingResponse | null>(null);
  const [availableCars, setAvailableCars] = useState<CarResponse[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [approveRemark, setApproveRemark] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);

  // Reject Modal state
  const [rejectingBooking, setRejectingBooking] = useState<BookingResponse | null>(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // View details modal
  const [viewBooking, setViewBooking] = useState<BookingResponse | null>(null);

  const loadBookings = () => {
    setLoading(true);
    adminService
      .getBookings(statusFilter ? (statusFilter as BookingStatus) : undefined)
      .then(setBookings)
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  // Open Approve Modal & fetch available cars for that specific booking
  const openApproveModal = async (b: BookingResponse) => {
    setApprovingBooking(b);
    setApproveRemark('');
    setSelectedCarId(null);
    setApproveLoading(true);

    try {
      const cars = await adminService.getAvailableCars(b.id);
      setAvailableCars(cars);
      if (cars.length > 0) {
        setSelectedCarId(cars[0].id);
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setApproveLoading(false);
    }
  };

  // Submit Approval
  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingBooking || !selectedCarId) {
      showError('Please choose a car from the available fleet');
      return;
    }

    setApproveLoading(true);
    try {
      await adminService.approveBooking(approvingBooking.id, {
        carId: selectedCarId,
        remark: approveRemark.trim() || undefined,
      });
      showSuccess(`Booking #${approvingBooking.id} approved!`);
      setApprovingBooking(null);
      loadBookings();
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setApproveLoading(false);
    }
  };

  // Submit Rejection
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingBooking) return;
    if (!rejectRemark.trim()) {
      showError('Please give a reason for rejecting the booking');
      return;
    }

    setRejectLoading(true);
    try {
      await adminService.rejectBooking(rejectingBooking.id, {
        remark: rejectRemark.trim(),
      });
      showSuccess(`Booking #${rejectingBooking.id} rejected.`);
      setRejectingBooking(null);
      loadBookings();
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setRejectLoading(false);
    }
  };

  // Complete Booking
  const handleComplete = async (bookingId: number) => {
    try {
      await adminService.completeBooking(bookingId);
      showSuccess(`Booking #${bookingId} marked as COMPLETED.`);
      loadBookings();
    } catch (err: any) {
      showError(getErrorMessage(err));
    }
  };

  const filtered = bookings.filter((b) =>
    `${b.id} ${b.customerName} ${b.customerEmail} ${b.variantName} ${b.carRegistrationNumber || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            Booking Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Booking Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review customer reservations, assign physical vehicle plates, approve or reject requests
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
              placeholder="Search booking #, customer, car..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
          >
            <option value="">All Statuses ({bookings.length})</option>
            <option value="PENDING">PENDING (Awaiting car)</option>
            <option value="APPROVED">APPROVED (Awaiting payment)</option>
            <option value="CONFIRMED">CONFIRMED (Paid)</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing: <strong className="text-white">{filtered.length}</strong> bookings
        </span>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No bookings match criteria</h3>
          <p className="text-xs text-slate-500">Change your filter or search query.</p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Booking #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Dates & Duration</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Assigned Plate</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-white">#{b.id}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-white block">{b.customerName}</span>
                      <span className="text-[11px] text-slate-400">{b.customerEmail}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-200">
                      {b.companyName} {b.variantName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300 block">
                        {b.pickupDate} → {b.returnDate}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {b.totalDays} Days
                      </span>
                    </td>
                    <td className="px-5 py-4 font-black text-white">${b.totalAmount}</td>
                    <td className="px-5 py-4">
                      {b.carRegistrationNumber ? (
                        <span className="font-mono bg-slate-900 text-emerald-400 font-bold px-2 py-0.5 rounded border border-slate-800">
                          {b.carRegistrationNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If PENDING: allow Approve & Reject */}
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openApproveModal(b)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Approve and assign car"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingBooking(b);
                                setRejectRemark('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Reject booking"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* If CONFIRMED (paid): allow Complete */}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleComplete(b.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Mark as Completed"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => setViewBooking(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve & Assign Car Modal */}
      <Modal
        isOpen={Boolean(approvingBooking)}
        onClose={() => setApprovingBooking(null)}
        title={`Approve Booking #${approvingBooking?.id}`}
        maxWidth="lg"
      >
        {approvingBooking && (
          <form onSubmit={handleApprove} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 uppercase font-bold text-[10px]">
                Requested Model & Dates
              </span>
              <p className="font-bold text-sm text-slate-900">
                {approvingBooking.companyName} {approvingBooking.variantName}
              </p>
              <p className="text-slate-600">
                {approvingBooking.pickupDate} to {approvingBooking.returnDate} ({approvingBooking.totalDays} Days) • Total: ${approvingBooking.totalAmount}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                Select Physical Car to Assign ({availableCars.length} available)
              </label>

              {availableCars.length === 0 ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    No physical car units of this variant are currently available without date clash! Add more cars or set existing cars to AVAILABLE.
                  </span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableCars.map((car) => (
                    <label
                      key={car.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedCarId === car.id
                          ? 'border-blue-600 bg-blue-50/70 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="assignedCar"
                          checked={selectedCarId === car.id}
                          onChange={() => setSelectedCarId(car.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-mono font-bold text-xs uppercase block">
                            {car.registrationNumber}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Color: {car.color || 'Standard'} • Year: {car.manufacturingYear}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        AVAILABLE
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Admin Remark / Note to Customer (Optional)
              </label>
              <input
                type="text"
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder="e.g. Assigned top condition unit. Pickup ready at Terminal 1."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setApprovingBooking(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approveLoading || !selectedCarId || availableCars.length === 0}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                {approveLoading ? 'Approving...' : 'Confirm Approval & Assign Car'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectingBooking)}
        onClose={() => setRejectingBooking(null)}
        title={`Reject Booking #${rejectingBooking?.id}`}
      >
        {rejectingBooking && (
          <form onSubmit={handleReject} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs space-y-1">
              <p className="font-bold">Rejecting Reservation Request</p>
              <p className="text-[11px] opacity-90">
                Customer: {rejectingBooking.customerName} ({rejectingBooking.customerEmail})
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Reason for Rejection (Required)
              </label>
              <textarea
                required
                rows={3}
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="Please state why this booking cannot be fulfilled..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingBooking(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejectLoading || !rejectRemark.trim()}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                {rejectLoading ? 'Rejecting...' : 'Reject Booking'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Booking Modal */}
      <Modal
        isOpen={Boolean(viewBooking)}
        onClose={() => setViewBooking(null)}
        title={`Booking #${viewBooking?.id} Complete Overview`}
        maxWidth="lg"
      >
        {viewBooking && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {viewBooking.companyName} {viewBooking.variantName}
                </h4>
                <p className="text-slate-500">Customer: {viewBooking.customerName} ({viewBooking.customerEmail})</p>
              </div>
              <StatusBadge status={viewBooking.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Pickup Date</span>
                <p className="font-semibold text-slate-900">{viewBooking.pickupDate}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Return Date</span>
                <p className="font-semibold text-slate-900">{viewBooking.returnDate}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Daily Rate & Duration</span>
                <p className="font-semibold text-slate-900">${viewBooking.pricePerDay} × {viewBooking.totalDays} Days</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase">Total Amount</span>
                <p className="font-bold text-base text-blue-600">${viewBooking.totalAmount}</p>
              </div>
            </div>

            {viewBooking.carRegistrationNumber && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Assigned Vehicle</span>
                <p className="font-mono font-bold text-sm">Plate Number: {viewBooking.carRegistrationNumber}</p>
              </div>
            )}

            {viewBooking.adminRemark && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Admin Remark</span>
                <p className="mt-0.5">{viewBooking.adminRemark}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewBooking(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
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
