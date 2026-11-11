import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import {
  VariantResponse,
  CompanyResponse,
  FuelType,
  Transmission,
} from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Car,
  Fuel,
  Gauge,
  Users,
  Search,
} from 'lucide-react';

export const AdminVariantManagement: React.FC = () => {
  const [variants, setVariants] = useState<VariantResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useNotification();

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantResponse | null>(null);
  const [companyId, setCompanyId] = useState<number>(1);
  const [name, setName] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [transmission, setTransmission] = useState<Transmission>('AUTOMATIC');
  const [seatingCapacity, setSeatingCapacity] = useState<number>(5);
  const [pricePerDay, setPricePerDay] = useState<number>(85);
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getVariants(selectedCompanyId ? Number(selectedCompanyId) : undefined),
      adminService.getCompanies(),
    ])
      .then(([vData, cData]) => {
        setVariants(vData);
        setCompanies(cData);
        if (cData.length > 0 && !companyId) {
          setCompanyId(cData[0].id);
        }
      })
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedCompanyId]);

  const openCreateModal = () => {
    setEditingVariant(null);
    setName('');
    setFuelType('PETROL');
    setTransmission('AUTOMATIC');
    setSeatingCapacity(5);
    setPricePerDay(85);
    setImageUrl('');
    if (companies.length > 0) setCompanyId(companies[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (v: VariantResponse) => {
    setEditingVariant(v);
    setCompanyId(v.companyId);
    setName(v.name);
    setFuelType(v.fuelType);
    setTransmission(v.transmission);
    setSeatingCapacity(v.seatingCapacity);
    setPricePerDay(Number(v.pricePerDay));
    setImageUrl(v.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Variant model name is required');
      return;
    }
    if (!pricePerDay || pricePerDay < 1) {
      showError('Price per day must be at least $1.00');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        companyId,
        name: name.trim(),
        fuelType,
        transmission,
        seatingCapacity: Number(seatingCapacity),
        pricePerDay: Number(pricePerDay),
        imageUrl: imageUrl.trim() || undefined,
      };

      if (editingVariant) {
        await adminService.updateVariant(editingVariant.id, payload);
        showSuccess(`Variant "${name}" updated successfully`);
      } else {
        await adminService.createVariant(payload);
        showSuccess(`Variant "${name}" created successfully`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await adminService.deleteVariant(deletingId);
      showSuccess('Car variant deleted successfully');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = variants.filter((v) =>
    `${v.companyName} ${v.name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            Fleet Catalogue
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Car Variant Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Define car models, specs, transmission, seating, daily pricing, and catalog banners
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Car Variant
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search model name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 self-end sm:self-auto">
          Total Variants: <strong className="text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Variants Table / Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Loading variants...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <SlidersHorizontal className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No variants found</h3>
          <p className="text-xs text-slate-500">Create your first vehicle model using the button above.</p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Vehicle Model</th>
                  <th className="px-5 py-3.5">Brand</th>
                  <th className="px-5 py-3.5">Fuel & Gear</th>
                  <th className="px-5 py-3.5">Seats</th>
                  <th className="px-5 py-3.5">Rate / Day</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            v.imageUrl ||
                            'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={v.name}
                          className="w-12 h-9 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white text-sm block">{v.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">ID #{v.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-200">{v.companyName}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="capitalize font-semibold text-white">
                          {v.fuelType.toLowerCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {v.transmission.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">{v.seatingCapacity} Seats</td>
                    <td className="px-5 py-4">
                      <span className="font-black text-sm text-blue-400">${v.pricePerDay}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(v.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVariant ? `Edit ${editingVariant.name}` : 'Add Car Variant'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Manufacturer Company
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Variant / Model Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 3 Series M Sport, Model 3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Transmission
              </label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as Transmission)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Seating Capacity
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Daily Rental Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min={1}
                value={pricePerDay}
                onChange={(e) => setPricePerDay(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Vehicle Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              {saving ? 'Saving...' : editingVariant ? 'Save Changes' : 'Create Variant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Car Variant"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete this variant? The backend requires that all registered car fleet units and past bookings are deleted or detached first.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
