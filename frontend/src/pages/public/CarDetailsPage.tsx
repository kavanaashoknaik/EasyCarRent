import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { CarListingResponse, AvailabilityResponse, ProfileResponse } from '../../types';
import {
  Calendar,
  Fuel,
  Gauge,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

export const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<CarListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<ProfileResponse | null>(null);

  const { isAuthenticated, isCustomer, user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  // Date selection state
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  // Fetch car details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    publicService
      .getCarById(Number(id))
      .then((data) => {
        setCar(data);
      })
      .catch((err) => {
        showError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [id, showError]);

  // Fetch customer profile if logged in
  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      customerService
        .getProfile(user?.email)
        .then(setCustomerProfile)
        .catch(() => {});
    }
  }, [isAuthenticated, isCustomer, user]);

  // Check availability whenever dates change
  const checkDatesAvailability = useCallback(() => {
    if (!id || !pickupDate || !returnDate) return;
    setCheckingAvail(true);
    publicService
      .checkAvailability(Number(id), pickupDate, returnDate)
      .then((res) => {
        setAvailability(res);
      })
      .catch((err) => {
        setAvailability(null);
        showError(getErrorMessage(err));
      })
      .finally(() => setCheckingAvail(false));
  }, [id, pickupDate, returnDate, showError]);

  useEffect(() => {
    checkDatesAvailability();
  }, [checkDatesAvailability]);

  // Handle instant booking
  const handleBooking = async () => {
    if (!isAuthenticated) {
      showInfo('Please log in or create an account to book this vehicle');
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    if (!isCustomer) {
      showError('Administrators cannot book cars. Please sign in with a customer account.');
      return;
    }

    if (customerProfile?.licenseStatus === 'NOT_UPLOADED') {
      showError('Please upload your driving licence in your profile before booking');
      navigate('/customer/profile');
      return;
    }

    if (customerProfile?.licenseStatus === 'REJECTED') {
      showError('Your previous driving licence was rejected. Please upload a valid licence.');
      navigate('/customer/profile');
      return;
    }

    if (!availability?.available) {
      showError('Car is not available for these dates.');
      return;
    }

    setBookingLoading(true);
    try {
      const newBooking = await customerService.createBooking(
        {
          variantId: Number(id),
          pickupDate,
          returnDate,
        },
        user?.email
      );

      showSuccess(`Booking #${newBooking.id} requested! Waiting for admin approval.`);
      navigate('/customer/bookings');
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-500">Loading vehicle specs...</span>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Car Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested vehicle does not exist or may have been unlisted.
        </p>
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Vehicles
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Showcase & Specs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visual */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md h-[360px] sm:h-[440px]">
            <img
              src={
                car.imageUrl ||
                'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
              }
              alt={`${car.companyName} ${car.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-sm">
              {car.companyName}
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{car.name}</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  EasyCarRent Verified Fleet
                </p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
                <span className="text-2xl sm:text-3xl font-black">${car.pricePerDay}</span>
                <span className="text-xs text-slate-300"> / day</span>
              </div>
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Vehicle Specifications & Features
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <Fuel className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-[11px] uppercase font-bold text-slate-400">Fuel Type</span>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {car.fuelType?.toLowerCase()}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <Gauge className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-[11px] uppercase font-bold text-slate-400">Transmission</span>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {car.transmission?.toLowerCase()}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-[11px] uppercase font-bold text-slate-400">Capacity</span>
                <span className="text-sm font-bold text-slate-900">
                  {car.seatingCapacity} Passengers
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                <span className="text-[11px] uppercase font-bold text-slate-400">Fleet Units</span>
                <span className="text-sm font-bold text-slate-900">
                  {car.availableCars} Available
                </span>
              </div>
            </div>

            {/* Included in Rental */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Included in Your Rental
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comprehensive Damage Waiver</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24/7 Nationwide Roadside Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sanitized & Deep Cleaned Before Handover</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free Cancellation up to Pickup Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Instant Booking & Availability Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-6 sticky top-28">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Reservation Summary
                </span>
                <span className="text-xs font-semibold text-slate-500">Max 30 days</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">Book This Vehicle</h3>
            </div>

            {/* Date Pickers */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Live Availability Calculation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              {checkingAvail ? (
                <div className="flex items-center justify-center py-4 text-xs font-semibold text-slate-500 gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Checking real-time fleet availability...
                </div>
              ) : availability ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Status for Selected Dates:</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        availability.available ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {availability.available ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {availability.carsLeft} units free
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Unavailable
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <span>Duration:</span>
                    <span className="font-bold text-slate-900">{availability.totalDays} Days</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Rate:</span>
                    <span className="font-semibold">${car.pricePerDay} × {availability.totalDays} days</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-xl text-blue-600 font-black">
                      ${availability.totalAmount}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 text-center py-2">
                  Select valid pickup and return dates to calculate price.
                </div>
              )}
            </div>

            {/* License Requirement Warning */}
            {isAuthenticated && isCustomer && customerProfile?.licenseStatus === 'NOT_UPLOADED' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  Driving Licence Required
                </p>
                <p className="text-[11px] text-amber-700">
                  Please upload your driving licence before submitting a booking.
                </p>
                <Link
                  to="/customer/profile"
                  className="inline-block mt-1 font-bold text-amber-800 underline hover:text-amber-950"
                >
                  Upload Licence Now →
                </Link>
              </div>
            )}

            {/* Reserve CTA Button */}
            <button
              onClick={handleBooking}
              disabled={
                bookingLoading ||
                checkingAvail ||
                !availability ||
                !availability.available
              }
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Booking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Request Booking Now</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              * Payment is only processed after your booking is approved by the admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
