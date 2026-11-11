import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import {
  CarListingResponse,
  CompanyResponse,
  FuelType,
  Transmission,
} from '../../types';
import { CarCard } from '../../components/common/CarCard';
import {
  Filter,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Car,
  Fuel,
  Gauge,
  Users,
  DollarSign,
  X,
} from 'lucide-react';

export const BrowseCarsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarListingResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const [companyId, setCompanyId] = useState<string>(searchParams.get('companyId') || '');
  const [fuelType, setFuelType] = useState<string>(searchParams.get('fuelType') || '');
  const [transmission, setTransmission] = useState<string>(searchParams.get('transmission') || '');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [seats, setSeats] = useState<string>(searchParams.get('seats') || '');
  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');

  // Load companies once
  useEffect(() => {
    publicService.getCompanies().then(setCompanies).catch(console.error);
  }, []);

  const fetchCars = useCallback(() => {
    setLoading(true);
    publicService
      .searchCars({
        companyId: companyId ? Number(companyId) : undefined,
        fuelType: (fuelType as FuelType) || undefined,
        transmission: (transmission as Transmission) || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        seats: seats ? Number(seats) : undefined,
        keyword: keyword || undefined,
      })
      .then((data) => {
        setCars(data);
      })
      .catch((err) => {
        console.error('Error fetching cars:', err);
      })
      .finally(() => setLoading(false));
  }, [companyId, fuelType, transmission, minPrice, maxPrice, seats, keyword]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleReset = () => {
    setCompanyId('');
    setFuelType('');
    setTransmission('');
    setMinPrice('');
    setMaxPrice('');
    setSeats('');
    setKeyword('');
    setSearchParams({});
  };

  const activeFiltersCount = [
    companyId,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    seats,
    keyword,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            EasyCarRent Fleet
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Browse All Cars
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose from our extensive collection of luxury sedans, electrics, and rugged SUVs.
          </p>
        </div>

        {/* Keyword Search */}
        <div className="flex items-center gap-3 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by model or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-xs"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters Desktop */}
        <aside
          className={`md:block ${
            mobileFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
          } md:static md:p-0 md:bg-transparent md:z-auto`}
        >
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Filter Cars
              </h3>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                {mobileFilterOpen && (
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="md:hidden p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Company Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                Brand / Manufacturer
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">All Brands</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-blue-600" />
                Fuel Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['', 'PETROL', 'DIESEL', 'ELECTRIC', 'CNG'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFuelType(type)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                      fuelType === type
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === '' ? 'Any' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                Transmission
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Any', value: '' },
                  { label: 'Automatic', value: 'AUTOMATIC' },
                  { label: 'Manual', value: 'MANUAL' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTransmission(item.value)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                      transmission === item.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seating Capacity */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Minimum Seats
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Any', value: '' },
                  { label: '4+', value: '4' },
                  { label: '5+', value: '5' },
                  { label: '7+', value: '7' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSeats(item.value)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                      seats === item.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                Daily Rate ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md"
              >
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        {/* Cars Grid */}
        <main className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{cars.length}</strong> vehicles available
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-88 rounded-2xl bg-slate-200 animate-pulse border border-slate-300"
                />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No cars match your criteria</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing fuel or transmission filters, or searching for another model.
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
