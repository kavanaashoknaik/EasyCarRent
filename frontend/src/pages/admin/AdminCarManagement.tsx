import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { CarResponse, VariantResponse, CarStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CarFront, Plus, Edit2, Trash2, Search, Wrench, CheckCircle } from 'lucide-react';

export const AdminCarManagement: React.FC = () => {
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [variants, setVariants] = useState<VariantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useNotification();

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarResponse | null>(null);
  const [variantId, setVariantId] = useState<number>(1);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [color, setColor] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState<number>(2024);
  const [status, setStatus] = useState<CarStatus>('AVAILABLE');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getCars(selectedVariantId ? Number(selectedVariantId) : undefined),
      adminService.getVariants(),
    ])
      .then(([cData, vData]) => {
        setCars(cData);
        setVariants(vData);
        if (vData.length > 0 && !variantId) {
          setVariantId(vData[0].id);
        }
      })
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedVariantId]);

  const openCreateModal = () => {
    setEditingCar(null);
    setRegistrationNumber('');
    setColor('Black');
    setManufacturingYear(2024);
    setStatus('AVAILABLE');
    if (variants.length > 0) setVariantId(variants[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (c: CarResponse) => {
    setEditingCar(c);
    setVariantId(c.variantId);
    setRegistrationNumber(c.registrationNumber);
    setColor(c.color || '');
    setManufacturingYear(c.manufacturingYear || 2024);
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber.trim()) {
      showError('Registration licence plate number is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        variantId,
        registrationNumber: registrationNumber.trim().toUpperCase(),
        color: color.trim() || undefined,
        manufacturingYear: Number(manufacturingYear),
        status,
      };

      if (editingCar) {
        await adminService.updateCar(editingCar.id, payload);
        showSuccess(`Car "${payload.registrationNumber}" updated`);
      } else {
        await adminService.createCar(payload);
        showSuccess(`Car "${payload.registrationNumber}" added to fleet`);
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
      await adminService.deleteCar(deletingId);
      showSuccess('Car unit removed from fleet');
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = cars.filter((c) =>
    `${c.registrationNumber} ${c.companyName} ${c.variantName} ${c.color}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            Fleet Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Car Fleet Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Register physical vehicles, manage licence plate numbers, colors, and maintenance statuses
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle Unit
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search plate or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option value="">All Models ({variants.length})</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.companyName} {v.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Units Listed: <strong className="text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Cars Table */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Loading fleet vehicles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <CarFront className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No cars found</h3>
          <p className="text-xs text-slate-500">
            Register your first physical car unit using the button above.
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Plate Number</th>
                  <th className="px-5 py-3.5">Assigned Model</th>
                  <th className="px-5 py-3.5">Color & Year</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-sm text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                        {c.registrationNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm">
                        {c.companyName} {c.variantName}
                      </div>
                      <span className="text-[10px] text-slate-500">Unit #{c.id}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.color || 'Unspecified'}</span>
                        <span>•</span>
                        <span className="text-slate-400">{c.manufacturingYear}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
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
        title={editingCar ? `Edit Car Unit ${editingCar.registrationNumber}` : 'Register Car Unit'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Vehicle Model Variant
            </label>
            <select
              value={variantId}
              onChange={(e) => setVariantId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.companyName} {v.name} (${v.pricePerDay}/day)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Registration Licence Plate
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
              placeholder="e.g. KA-01-BM-3001"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Body Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Mineral White"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Manufacturing Year
              </label>
              <input
                type="number"
                min={2000}
                max={2100}
                value={manufacturingYear}
                onChange={(e) => setManufacturingYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Unit Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CarStatus)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="AVAILABLE">AVAILABLE (Ready for rentals)</option>
              <option value="MAINTENANCE">MAINTENANCE (Servicing / Inactive)</option>
            </select>
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
              {saving ? 'Saving...' : editingCar ? 'Save Changes' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Remove Car from Fleet"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to remove this car? If it has existing bookings assigned, the backend will prevent deletion. You can set its status to MAINTENANCE instead.
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
              {deleting ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
