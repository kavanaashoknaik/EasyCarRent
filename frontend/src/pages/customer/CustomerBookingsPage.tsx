import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { BookingResponse, BookingStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Car,
  CreditCard,
  Ban,
  Clock,
  Eye,
  AlertTriangle,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export const CustomerBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Cancel modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingResponse | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Selected detail modal
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    customerService
      .getMyBookings(user?.email)
      .then(setBookings)
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelLoading(true);
    try {
      await customerService.cancelBooking(cancelModalBooking.id, user?.email);
      showSuccess(`Booking #${cancelModalBooking.id} cancelled successfully`);
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings =
    statusFilter === 'ALL'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const filterTabs = [
    { label: 'All', value: 'ALL', count: bookings.length },
    {
      label: 'Pending',
      value: 'PENDING',
      count: bookings.filter((b) => b.status === 'PENDING').length,
    },
    {
      label: 'Approved',
      value: 'APPROVED',
      count: bookings.filter((b) => b.status === 'APPROVED').length,
    },
    {
      label: 'Confirmed',
      value: 'CONFIRMED',
      count: bookings.filter((b) => b.status === 'CONFIRMED').length,
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
      count: bookings.filter((b) => b.status === 'COMPLETED').length,
    },
    {
      label: 'Cancelled',
      value: 'CANCELLED',
      count: bookings.filter((b) => b.status === 'CANCELLED').length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Bookings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, track approvals, pay, and manage your vehicle reservations
          </p>
        </div>
        <Link
          to="/cars"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Car className="w-4 h-4" />
          Rent Another Car
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.value
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 mt-3">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No {statusFilter.toLowerCase()} bookings</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'ALL'
              ? 'You have not made any car reservations yet.'
              : `You have no bookings currently in ${statusFilter.toLowerCase()} status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const today = new Date().toISOString().split('T')[0];
            const canCancel =
              ['PENDING', 'APPROVED', 'CONFIRMED'].includes(b.status) && today < b.pickupDate;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left info */}
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={
                      b.imageUrl ||
                      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=250&q=80'
                    }
                    alt={b.variantName}
                    className="w-20 h-16 sm:w-28 sm:h-20 object-cover rounded-2xl bg-slate-100 shrink-0 border border-slate-100"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{b.id}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">
                        {b.companyName} {b.variantName}
                      </h3>
                      <StatusBadge status={b.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {b.pickupDate} → {b.returnDate} ({b.totalDays} Days)
                      </span>
                      <span>•</span>
                      <span>
                        Rate: <strong>${b.pricePerDay}</strong> / day
                      </span>
                      <span>•</span>
                      <span className="text-sm font-black text-slate-900">
                        Total: ${b.totalAmount}
                      </span>
                    </div>

                    {b.carRegistrationNumber && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Assigned Plate: {b.carRegistrationNumber}
                        </span>
                      </div>
                    )}

                    {b.adminRemark && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-1">
                        Note: {b.adminRemark}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  {/* Pay Now Button if APPROVED */}
                  {b.status === 'APPROVED' && (
                    <Link
                      to={`/customer/payments/checkout?bookingId=${b.id}`}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Now (${b.totalAmount})
                    </Link>
                  )}

                  {/* View Details */}
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>

                  {/* View Receipt if CONFIRMED or COMPLETED */}
                  {(b.status === 'CONFIRMED' || b.status === 'COMPLETED') && (
                    <Link
                      to={`/customer/payments`}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Receipt
                    </Link>
                  )}

                  {/* Cancel Button */}
                  {canCancel && (
                    <button
                      onClick={() => setCancelModalBooking(b)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Detail Modal */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title={`Booking #${selectedBooking?.id} Details`}
        maxWidth="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={selectedBooking.imageUrl}
                alt={selectedBooking.variantName}
                className="w-24 h-16 object-cover rounded-xl"
              />
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {selectedBooking.companyName} {selectedBooking.variantName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedBooking.status} size="sm" />
                  <span className="text-xs text-slate-500">
                    Created on {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase">Pickup Date</span>
                <p className="font-semibold text-slate-900 text-sm">{selectedBooking.pickupDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase">Return Date</span>
                <p className="font-semibold text-slate-900 text-sm">{selectedBooking.returnDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase">Duration</span>
                <p className="font-semibold text-slate-900 text-sm">{selectedBooking.totalDays} Days</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase">Total Cost</span>
                <p className="font-bold text-blue-600 text-base">${selectedBooking.totalAmount}</p>
              </div>
            </div>

            {selectedBooking.carRegistrationNumber && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700">
                  Vehicle Assigned
                </span>
                <p className="font-mono font-bold text-sm">
                  Plate: {selectedBooking.carRegistrationNumber}
                </p>
              </div>
            )}

            {selectedBooking.adminRemark && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Admin Remarks
                </span>
                <p>{selectedBooking.adminRemark}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalBooking)}
        onClose={() => setCancelModalBooking(null)}
        title="Confirm Booking Cancellation"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              Are you sure you want to cancel booking #{cancelModalBooking?.id} for{' '}
              <strong>
                {cancelModalBooking?.companyName} {cancelModalBooking?.variantName}
              </strong>
              ?
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Per EasyCarRent policy, bookings may be cancelled anytime prior to the scheduled pickup date without penalty.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setCancelModalBooking(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
            >
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Reservation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
