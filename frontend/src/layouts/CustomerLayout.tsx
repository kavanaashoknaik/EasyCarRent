import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../services/customerService';
import { ProfileResponse } from '../types';
import { StatusBadge } from '../components/common/Badge';
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  CreditCard,
  FileCheck2,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    customerService
      .getProfile(user?.email)
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch((err) => {
        console.warn('Failed to fetch profile in layout:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const navItems = [
    {
      to: '/customer/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/customer/bookings',
      label: 'My Bookings',
      icon: CalendarCheck,
    },
    {
      to: '/customer/profile',
      label: 'Profile & Driving Licence',
      icon: User,
    },
    {
      to: '/customer/payments',
      label: 'Payment History',
      icon: CreditCard,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header breadcrumb & welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              EasyCarRent
            </Link>
            <span>/</span>
            <span className="text-slate-900">Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {profile?.fullName || user?.fullName || 'Valued Customer'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Browse New Cars
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                {(profile?.fullName || user?.fullName || 'C')[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-900 truncate">
                  {profile?.fullName || user?.fullName}
                </h4>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Driving Licence:</span>
                <StatusBadge status={profile?.licenseStatus || 'NOT_UPLOADED'} size="sm" />
              </div>
              {profile?.licenseNumber && (
                <div className="text-[11px] font-mono text-slate-600 truncate bg-slate-50 p-1.5 rounded">
                  No: {profile.licenseNumber}
                </div>
              )}
            </div>

            {profile?.licenseStatus === 'NOT_UPLOADED' && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Upload your driving licence to make instant car bookings.</span>
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="border-t border-slate-100 my-1 pt-1">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
