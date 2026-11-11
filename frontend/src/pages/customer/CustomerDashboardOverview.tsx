import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { BookingResponse, ProfileResponse, PaymentResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import {
  CalendarCheck,
  CreditCard,
  FileCheck2,
  Car,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const CustomerDashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      customerService.getProfile(user?.email),
      customerService.getMyBookings(user?.email),
      customerService.getMyPayments(user?.email),
    ])
      .then(([prof, bks, pymts]) => {
        setProfile(prof);
        setBookings(bks);
        setPayments(pymts);
      })
      .catch((err) => {
        console.error('Customer dashboard load error:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const activeBookings = bookings.filter((b) =>
    ['PENDING', 'APPROVED', 'CONFIRMED'].includes(b.status)
  );

  const totalSpent = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500 mt-3">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Driving License Banner if not verified */}
      {profile?.licenseStatus !== 'VERIFIED' && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            profile?.licenseStatus === 'NOT_UPLOADED'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : profile?.licenseStatus === 'PENDING'
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/80 shadow-xs">
              <FileCheck2 className="w-6 h-6 text-current" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                Driving Licence Status: {profile?.licenseStatus?.replace('_', ' ')}
              </h4>
              <p className="text-xs opacity-80 mt-0.5">
                {profile?.licenseStatus === 'NOT_UPLOADED'
                  ? 'Please upload your driving licence to enable car reservations.'
                  : profile?.licenseStatus === 'PENDING'
                  ? 'Your licence is currently under admin verification.'
                  : 'Your licence submission was rejected. Please re-upload a valid document.'}
              </p>
            </div>
          </div>
          <Link
            to="/customer/profile"
            className="px-4 py-2 bg-white rounded-xl shadow-xs text-xs font-bold hover:bg-slate-50 transition-colors shrink-0 text-center"
          >
            Manage Licence →
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Bookings</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeBookings.length}</div>
          <p className="text-[11px] text-slate-500">Pending, approved or confirmed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{bookings.length}</div>
          <p className="text-[11px] text-slate-500">All-time reservation requests</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">${totalSpent}</div>
          <p className="text-[11px] text-slate-500">Completed rental payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Licence Status</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <StatusBadge status={profile?.licenseStatus || 'NOT_UPLOADED'} size="md" />
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-1">
            {profile?.licenseNumber ? `ID: ${profile.licenseNumber}` : 'Not registered yet'}
          </p>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recent Bookings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track your reservation statuses and complete pending approvals
            </p>
          </div>
          <Link
            to="/customer/bookings"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No bookings yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Browse our luxury fleet and request your first rental today!
            </p>
            <Link
              to="/cars"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      b.imageUrl ||
                      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={b.variantName}
                    className="w-16 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {b.companyName} {b.variantName}
                      </h4>
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {b.pickupDate} → {b.returnDate} ({b.totalDays} days) •{' '}
                      <strong className="text-slate-800">${b.totalAmount}</strong>
                    </p>
                    {b.carRegistrationNumber && (
                      <span className="inline-block mt-1 font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                        Assigned: {b.carRegistrationNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {b.status === 'APPROVED' && (
                    <Link
                      to={`/customer/payments/checkout?bookingId=${b.id}`}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Pay Now (${b.totalAmount})
                    </Link>
                  )}
                  <Link
                    to={`/customer/bookings/${b.id}`}
                    className="px-3 py-1.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
