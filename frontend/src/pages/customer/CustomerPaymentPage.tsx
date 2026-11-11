import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { BookingResponse, PaymentMethod, PaymentResponse } from '../../types';
import {
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  ArrowLeft,
  Calendar,
  Lock,
} from 'lucide-react';

export const CustomerPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentResponse | null>(null);

  // Form dummy fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookingIdParam) {
      navigate('/customer/bookings');
      return;
    }

    customerService
      .getMyBooking(Number(bookingIdParam), user?.email)
      .then((data) => {
        setBooking(data);
        if (data.status === 'CONFIRMED' || data.status === 'COMPLETED') {
          // If already paid, fetch receipt
          customerService
            .getReceipt(data.id, user?.email)
            .then(setReceipt)
            .catch(() => {});
        }
      })
      .catch((err) => {
        showError(getErrorMessage(err));
        navigate('/customer/bookings');
      })
      .finally(() => setLoading(false));
  }, [bookingIdParam, user, navigate, showError]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (booking.status !== 'APPROVED') {
      showError(`Booking is currently ${booking.status}. Only APPROVED bookings can be paid.`);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await customerService.pay(
        {
          bookingId: booking.id,
          paymentMethod,
        },
        user?.email
      );

      setReceipt(res);
      showSuccess(`Payment of $${res.amount} successful! Booking confirmed.`);
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500 mt-3">Loading checkout details...</p>
      </div>
    );
  }

  // If payment succeeded, show the receipt view
  if (receipt) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Payment Successful!</h2>
            <p className="text-emerald-100 text-xs font-medium">
              Your rental reservation with EasyCarRent is now confirmed
            </p>
          </div>

          {/* Receipt details */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Transaction Reference
                </span>
                <p className="font-mono font-bold text-sm text-slate-900">{receipt.transactionId}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Amount Paid
                </span>
                <p className="text-2xl font-black text-emerald-600">${receipt.amount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-bold">Booking ID</span>
                <p className="font-semibold text-slate-900">#{receipt.bookingId}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-bold">Vehicle</span>
                <p className="font-semibold text-slate-900">{receipt.carName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-bold">Payment Method</span>
                <p className="font-semibold text-slate-900 capitalize">
                  {receipt.paymentMethod.replace('_', ' ')}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-bold">Paid At</span>
                <p className="font-semibold text-slate-900">
                  {new Date(receipt.paidAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                An official receipt has been issued. You may print this page or present your booking ID at pickup.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/customer/bookings"
                className="flex-1 py-3 text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Go to My Bookings
              </Link>
              <Link
                to="/customer/payments"
                className="flex-1 py-3 text-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                View Payment Records
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/customer/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Bookings
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
          Secure Payment Checkout
        </h2>
        <p className="text-xs text-slate-500">
          Complete payment to confirm your booking for {booking.companyName} {booking.variantName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Summary Box */}
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 h-fit">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Booking Summary
          </h4>

          <img
            src={booking.imageUrl}
            alt={booking.variantName}
            className="w-full h-32 object-cover rounded-xl bg-slate-100"
          />

          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {booking.companyName} {booking.variantName}
            </h3>
            {booking.carRegistrationNumber && (
              <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                Plate: {booking.carRegistrationNumber}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Pickup:</span>
              <span className="font-semibold text-slate-900">{booking.pickupDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Return:</span>
              <span className="font-semibold text-slate-900">{booking.returnDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-semibold text-slate-900">{booking.totalDays} Days</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-blue-600 font-black text-lg">${booking.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleProcessPayment} className="space-y-6">
            {/* Method Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CARD' as PaymentMethod, label: 'Card', icon: CreditCard },
                  { id: 'UPI' as PaymentMethod, label: 'UPI / QR', icon: QrCode },
                  { id: 'NET_BANKING' as PaymentMethod, label: 'Net Banking', icon: Building },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === item.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-xs font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-current" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@upi"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  A payment request will be sent to your Google Pay, PhonePe, or Paytm app.
                </p>
              </div>
            )}

            {paymentMethod === 'NET_BANKING' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Select Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ${booking.totalAmount} Securely</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit Encrypted Simulated Payment Gateway</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
