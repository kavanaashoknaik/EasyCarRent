import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DashboardResponse } from '../../types';
import {
  Users,
  Car,
  CalendarDays,
  DollarSign,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then(setStats)
      .catch((err) => console.error('Error fetching admin dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-400 mt-3">Loading dashboard metrics...</p>
      </div>
    );
  }

  // Chart data for bookings breakdown
  const bookingStatusData = [
    { name: 'Pending', count: Number(stats.pendingBookings), color: '#f59e0b' },
    { name: 'Approved', count: Number(stats.approvedBookings), color: '#0ea5e9' },
    { name: 'Confirmed', count: Number(stats.confirmedBookings), color: '#10b981' },
    { name: 'Completed', count: Number(stats.completedBookings), color: '#6366f1' },
    { name: 'Cancelled', count: Number(stats.cancelledBookings), color: '#ef4444' },
    { name: 'Rejected', count: Number(stats.rejectedBookings), color: '#f43f5e' },
  ];

  // Fleet distribution data
  const fleetData = [
    { name: 'Available Units', count: Number(stats.availableCars) },
    {
      name: 'Busy / In Fleet',
      count: Math.max(0, Number(stats.totalCars) - Number(stats.availableCars)),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            EasyCarRent Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/bookings"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            Manage Bookings
          </Link>
          <Link
            to="/admin/licenses"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs transition-colors"
          >
            Verify Licences
          </Link>
        </div>
      </div>

      {/* Action Alerts */}
      {(stats.pendingLicenses > 0 || stats.pendingBookings > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingLicenses > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-200">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">{stats.pendingLicenses} Driving Licences</span>{' '}
                  pending review
                </div>
              </div>
              <Link
                to="/admin/licenses"
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                Review Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {stats.pendingBookings > 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-blue-200">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">{stats.pendingBookings} New Bookings</span> waiting
                  for vehicle assignment
                </div>
              </div>
              <Link
                to="/admin/bookings"
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
              >
                Assign Cars <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* High Level Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">${stats.totalRevenue}</div>
          <p className="text-[11px] text-slate-400">Paid and confirmed rentals</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalBookings}</div>
          <p className="text-[11px] text-slate-400">
            {stats.confirmedBookings} confirmed • {stats.pendingBookings} pending
          </p>
        </div>

        {/* Fleet Cars */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Fleet Inventory</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalCars}</div>
          <p className="text-[11px] text-slate-400">
            {stats.availableCars} available • {stats.totalVariants} model variants
          </p>
        </div>

        {/* Customers */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalCustomers}</div>
          <p className="text-[11px] text-slate-400">
            {stats.pendingLicenses} licences awaiting verification
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Status Distribution Bar */}
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Booking Status Distribution</h3>
            <span className="text-xs text-slate-400">Real-time status count</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Breakdown & Quick Links */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">Fleet Readiness</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Manufacturer Brands:</span>
                <span className="font-bold text-white">{stats.totalCompanies} Brands</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Car Variants:</span>
                <span className="font-bold text-white">{stats.totalVariants} Models</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Total Registered Vehicles:</span>
                <span className="font-bold text-white">{stats.totalCars} Units</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Available to Rent Today:</span>
                <span className="font-bold text-emerald-400">{stats.availableCars} Units</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/admin/cars"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Fleet Units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
