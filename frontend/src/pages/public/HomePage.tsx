import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { CarListingResponse, CompanyResponse } from '../../types';
import { CarCard } from '../../components/common/CarCard';
import {
  Search,
  Calendar,
  Shield,
  Award,
  Clock,
  Car,
  ChevronRight,
  CheckCircle,
  FileCheck,
  Key,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredCars, setFeaturedCars] = useState<CarListingResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Search widget state
  const [selectedCompany, setSelectedCompany] = useState<string>('');
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

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([publicService.searchCars(), publicService.getCompanies()])
      .then(([carsData, compsData]) => {
        setFeaturedCars(carsData);
        setCompanies(compsData);
      })
      .catch((err) => {
        console.error('Error loading homepage catalog:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCompany) params.append('companyId', selectedCompany);
    if (pickupDate) params.append('pickupDate', pickupDate);
    if (returnDate) params.append('returnDate', returnDate);
    navigate(`/cars?${params.toString()}`);
  };

  const filteredCars =
    selectedBrandFilter === 'ALL'
      ? featuredCars
      : featuredCars.filter(
          (c) => c.companyName.toLowerCase() === selectedBrandFilter.toLowerCase()
        );

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[520px] lg:min-h-[580px] flex items-center justify-center bg-slate-900 overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Car on Coastal Road"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Reliable Car Rental Management System
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Find & Book Your Ideal <span className="text-blue-500">Rental Car</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Choose from an extensive selection of well-maintained sedans, SUVs, and luxury vehicles
            with transparent daily pricing and fast digital approval.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/cars"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Browse All Cars</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#search-bar"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors flex items-center justify-center"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* 2. SEARCH BAR WIDGET */}
      <section id="search-bar" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            Quick Car Search & Booking
          </h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Brand */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                Select Brand
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands ({companies.length})</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pickup Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Return Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Find Cars</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. FEATURED CARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Our Available Fleet
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Cars
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Drive away in comfortable, modern cars ready for immediate pickup.
            </p>
          </div>

          <Link
            to="/cars"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-auto"
          >
            <span>View All Cars ({featuredCars.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Brand Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedBrandFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedBrandFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Brands ({featuredCars.length})
          </button>
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedBrandFilter(c.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedBrandFilter.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-92 rounded-2xl bg-slate-200 animate-pulse border border-slate-300"
              />
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-2">
            <Car className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No cars found</h3>
            <p className="text-xs text-slate-500">Try selecting another brand filter above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.slice(0, 6).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* 4. WHY CHOOSE EASYCARRENT */}
      <section id="why-us" className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Why Choose EasyCarRent
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              We Make Car Rentals Simple and Convenient
            </h2>
            <p className="text-sm text-slate-600">
              Enjoy verified vehicles, transparent pricing, and instant digital approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Verified Fleet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                All vehicles are regularly serviced, thoroughly sanitized, and inspected before handover.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Best Price Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Competitive and transparent daily rental rates with zero hidden charges or surprises.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Fast Licence Check</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your driving licence directly in your profile for quick administrative review.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">24/7 Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Round-the-clock roadside assistance and friendly customer support whenever you need help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Rent Your Car in 4 Easy Steps
          </h2>
          <p className="text-sm text-slate-600">
            From car selection to picking up the keys, our process is fast and seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Choose Your Car</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore our models, check real-time availability, and pick your rental dates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Upload Licence</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit your driving licence number and document upload for quick verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Admin Approval</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our administrative team reviews your request and assigns a specific car unit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900">Pay & Drive</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pay securely via UPI, Card, or Net Banking, get your receipt, and enjoy your drive!
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black">Ready to Book Your Next Journey?</h2>
            <p className="text-sm text-blue-100 max-w-xl">
              Create an account in minutes or explore our full fleet of available cars with instant booking.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/cars"
              className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors shadow-md text-center"
            >
              Browse Fleet
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-sm transition-colors border border-blue-400/40 text-center"
            >
              Register Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
