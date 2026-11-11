import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { useNotification } from '../../context/NotificationContext';
import { getErrorMessage } from '../../services/api';
import { ProfileResponse } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Edit3,
  FileText,
} from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Licence upload state
  const [licenseNumber, setLicenseNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const loadProfile = () => {
    setLoading(true);
    customerService
      .getProfile(user?.email)
      .then((data) => {
        setProfile(data);
        setEditFullName(data.fullName || '');
        setEditPhone(data.phone || '');
        setEditAddress(data.address || '');
        setLicenseNumber(data.licenseNumber || '');
      })
      .catch((err) => {
        showError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  // Handle Edit Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      showError('Full name is required');
      return;
    }
    if (!/^[0-9]{10}$/.test(editPhone.trim())) {
      showError('Phone number must be exactly 10 digits');
      return;
    }

    setEditLoading(true);
    try {
      const updated = await customerService.updateProfile(
        {
          fullName: editFullName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
        },
        user?.email
      );

      setProfile(updated);
      updateCurrentUser({ fullName: updated.fullName });
      showSuccess('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Licence Upload
  const handleUploadLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber.trim()) {
      showError('Driving licence number is required');
      return;
    }
    if (!selectedFile) {
      showError('Please choose a licence image or PDF file to upload');
      return;
    }
    // Check 5 MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      showError('File exceeds backend 5 MB limit. Please choose a smaller file.');
      return;
    }

    setUploadLoading(true);
    try {
      const updated = await customerService.uploadLicense(
        licenseNumber.trim(),
        selectedFile,
        user?.email
      );
      setProfile(updated);
      showSuccess('Driving licence uploaded! It is now pending verification by our team.');
      setSelectedFile(null);
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500 mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {(profile?.fullName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {profile?.fullName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Customer Account</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            Edit Profile
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Email Address
            </span>
            <p className="font-semibold text-sm text-slate-900">{profile?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              Phone Number
            </span>
            <p className="font-semibold text-sm text-slate-900">{profile?.phone || 'Not set'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Delivery & Billing Address
            </span>
            <p className="font-medium text-sm text-slate-700">
              {profile?.address || 'No address added yet. Click Edit Profile to add your address.'}
            </p>
          </div>
        </div>
      </div>

      {/* Driving Licence Management Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              Driving Licence Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Backend requirement: An uploaded and verified licence is required before booking vehicles.
            </p>
          </div>
          <StatusBadge status={profile?.licenseStatus || 'NOT_UPLOADED'} size="md" />
        </div>

        {/* Current status info */}
        {profile?.licenseStatus === 'VERIFIED' ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Licence Verified & Active</p>
              <p className="opacity-90">
                Licence Number: <strong className="font-mono">{profile.licenseNumber}</strong>
              </p>
              <p className="opacity-80">
                You are fully cleared to book any car from the EasyCarRent fleet instantly!
              </p>
            </div>
          </div>
        ) : profile?.licenseStatus === 'PENDING' ? (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 space-y-1">
              <p className="font-bold">Licence Pending Review</p>
              <p className="opacity-90">
                Licence Number: <strong className="font-mono">{profile.licenseNumber}</strong>
              </p>
              <p className="opacity-80">
                Our administrative team is reviewing your uploaded document. You will be able to book cars as soon as it is approved.
              </p>
            </div>
          </div>
        ) : profile?.licenseStatus === 'REJECTED' ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 space-y-1">
              <p className="font-bold">Licence Rejected</p>
              <p className="opacity-80">
                The document provided was unclear, expired, or invalid. Please re-upload a clear copy below.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">No Driving Licence Uploaded</p>
              <p className="opacity-80">
                In compliance with rental regulations, you must submit your driving licence before reserving any vehicle.
              </p>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUploadLicense} className="space-y-5 pt-2">
          <h4 className="font-bold text-sm text-slate-900">
            {profile?.licenseUploaded ? 'Update or Re-upload Licence Document' : 'Upload Your Driving Licence'}
          </h4>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Driving Licence Number
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
              placeholder="e.g. DL-0420230019283"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Licence Document (JPG, PNG, or PDF, max 5 MB)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <UploadCloud className="w-8 h-8 text-blue-600" />
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-900">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-700">
                      Click to choose or drag & drop document
                    </p>
                    <p className="text-xs text-slate-400">
                      Official photo ID or Government issued driving permit
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={uploadLoading || !licenseNumber.trim() || !selectedFile}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {uploadLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Backend...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Submit Driving Licence for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Profile Information"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Phone Number (10 digits)
            </label>
            <input
              type="tel"
              value={editPhone}
              maxLength={10}
              onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Address
            </label>
            <textarea
              rows={3}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="Your complete residential address"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
