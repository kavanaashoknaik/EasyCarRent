import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackendStatusBanner } from '../components/common/BackendStatusBanner';
import { BackendGuideModal } from '../components/common/BackendGuideModal';
import { adminService } from '../services/adminService';
import {
  Car,
  LayoutDashboard,
  Building2,
  SlidersHorizontal,
  CarFront,
  Users,
  FileCheck2,
  CalendarDays,
  Receipt,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingLicenses, setPendingLicenses] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    adminService
      .getDashboard()
      .then((data) => {
        setPendingLicenses(Number(data.pendingLicenses) || 0);
        setPendingBookings(Number(data.pendingBookings) || 0);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
      end: true,
    },
    {
      to: '/admin/companies',
      label: 'Company Management',
      icon: Building2,
      badge: null,
    },
    {
      to: '/admin/variants',
      label: 'Variant Management',
      icon: SlidersHorizontal,
      badge: null,
    },
    {
      to: '/admin/cars',
      label: 'Car Fleet Units',
      icon: CarFront,
      badge: null,
    },
    {
      to: '/admin/customers',
      label: 'Customer Accounts',
      icon: Users,
      badge: null,
    },
    {
      to: '/admin/licenses',
      label: 'Licence Verification',
      icon: FileCheck2,
      badge: pendingLicenses > 0 ? pendingLicenses : null,
      badgeColor: 'bg-amber-500',
    },
    {
      to: '/admin/bookings',
      label: 'Booking Requests',
      icon: CalendarDays,
      badge: pendingBookings > 0 ? pendingBookings : null,
      badgeColor: 'bg-blue-500',
    },
    {
      to: '/admin/payments',
      label: 'Payment Audit',
      icon: Receipt,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <BackendStatusBanner />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">EasyCarRent Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`w-full md:w-64 bg-slate-950 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 ${
            sidebarOpen ? 'block' : 'hidden md:flex'
          }`}
        >
          <div className="space-y-6">
            {/* Admin Brand */}
            <div className="hidden md:flex items-center gap-3 pb-5 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-lg tracking-tight text-white flex items-center">
                  EasyCar<span className="text-blue-500">Rent</span>
                </h2>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800">
                  Admin Console
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-3 pb-2">
                Core Operations
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Admin User info & controls */}
          <div className="pt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white truncate">{user?.fullName || 'Admin'}</span>
                <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/"
                className="flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live Site
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl transition-colors border border-rose-900/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-900 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <BackendGuideModal />
    </div>
  );
};
