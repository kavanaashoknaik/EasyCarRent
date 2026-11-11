import React from 'react';
import { BookingStatus, LicenseStatus, CarStatus, PaymentStatus } from '../../types';

interface BadgeProps {
  status: BookingStatus | LicenseStatus | CarStatus | PaymentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    // BookingStatus
    case 'PENDING':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
      break;
    case 'APPROVED':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20';
      break;
    case 'CONFIRMED':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
      break;
    case 'COMPLETED':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'FAILED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
      break;

    // LicenseStatus
    case 'VERIFIED':
    case 'AVAILABLE':
    case 'SUCCESS':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
      break;
    case 'NOT_UPLOADED':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    case 'MAINTENANCE':
      colorClasses = 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500/20';
      break;

    default:
      break;
  }

  const formatText = (txt: string) => {
    return txt.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wider ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
