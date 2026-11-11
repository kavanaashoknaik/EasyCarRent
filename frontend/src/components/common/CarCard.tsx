import React from 'react';
import { Link } from 'react-router-dom';
import { CarListingResponse } from '../../types';
import { Fuel, Gauge, Users, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface CarCardProps {
  car: CarListingResponse;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const isAvailable = car.availableCars > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-200 transition-all duration-250 flex flex-col">
      {/* Car Photo */}
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        <img
          src={
            car.imageUrl ||
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80'
          }
          alt={`${car.companyName} ${car.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Brand Tag */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-xs">
          {car.companyName}
        </div>

        {/* Availability Badge */}
        <div
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs flex items-center gap-1 ${
            isAvailable
              ? 'bg-emerald-600/90 text-white'
              : 'bg-rose-600/90 text-white'
          }`}
        >
          {isAvailable ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{car.availableCars} left</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Reserved</span>
            </>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
          <span className="text-lg font-bold">${car.pricePerDay}</span>
          <span className="text-xs text-slate-300"> / day</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600">
            {car.companyName}
          </span>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {car.name}
          </h3>

          {/* Technical Specifications */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 text-center">
              <Fuel className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fuel</span>
              <span className="text-xs font-semibold text-slate-700 capitalize">
                {car.fuelType?.toLowerCase()}
              </span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 text-center">
              <Gauge className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-bold">Gear</span>
              <span className="text-xs font-semibold text-slate-700 capitalize">
                {car.transmission?.toLowerCase()}
              </span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 text-center">
              <Users className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-[10px] text-slate-400 uppercase font-bold">Seats</span>
              <span className="text-xs font-semibold text-slate-700">
                {car.seatingCapacity} Seats
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <Link
            to={`/cars/${car.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs active:scale-98"
          >
            <span>View & Book</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
