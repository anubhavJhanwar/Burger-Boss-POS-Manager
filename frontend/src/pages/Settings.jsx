import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertTriangle, Trash2, LogOut } from 'lucide-react';
import { deleteUser } from '../services/api';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';

const Settings = ({ user, onLogout }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUser(user.id);
      localStorage.removeItem('cafeUser');
      navigate('/signup');
    } catch (error) {
      addToast('Failed to delete account: ' + error.message, 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="text-gray-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-800">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="text-gray-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Security</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Lock className="text-gray-600" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">PIN</p>
              <p className="font-medium text-gray-800">••••••</p>
            </div>
            <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
              Change PIN
            </button>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. This will permanently delete your account and all associated data including orders, inventory, expenses, and transactions.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Delete Account?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
