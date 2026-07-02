import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { ErrorDisplay } from './ErrorDisplay';
import { parseValidationErrors } from '../utils/errorHandling';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { User } from '../types/api';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  email: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function ProfileModal({ user, isOpen, onClose }: ProfileModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProfileFormData>({
    email: user.email,
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    // Validate password confirmation if changing password
    if (isChangingPassword) {
      if (!formData.current_password) {
        setFormErrors(['Current password is required when changing password']);
        return;
      }
      if (!formData.new_password) {
        setFormErrors(['New password is required']);
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        setFormErrors(['New password and confirmation do not match']);
        return;
      }
    }

    try {
      // Update email if changed
      if (formData.email !== user.email) {
        await authAPI.updateProfile(user.id, { email: formData.email });
      }
      // Change password if requested
      if (isChangingPassword) {
        await authAPI.changePassword(formData.current_password, formData.new_password);
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setFormErrors([]);
      onClose();
    } catch (error) {
      const validationErrors = parseValidationErrors(error);
      setFormErrors(validationErrors.length > 0 ? validationErrors : ['Failed to update profile']);
    }
  };

  const resetForm = () => {
    setFormData({
      email: user.email,
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setFormErrors([]);
    setIsChangingPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Update Profile
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <ErrorDisplay errors={formErrors} className="mb-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <label htmlFor="username" className="stocky-label">
                Username (Read Only)
              </label>
              <input
                type="text"
                id="username"
                value={user.username}
                disabled
                className="stocky-input bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                Username cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="email" className="stocky-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="stocky-input"
              />
            </div>

            {/* Password Change Section */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="change_password"
                  checked={isChangingPassword}
                  onChange={(e) => setIsChangingPassword(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="change_password" className="ml-2 text-sm font-medium text-gray-700">
                  Change Password
                </label>
              </div>

              {isChangingPassword && (
                <>
                  <div className="mb-4">
                    <label htmlFor="current_password" className="stocky-label">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      id="current_password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      required={isChangingPassword}
                      className="stocky-input"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="new_password" className="stocky-label">
                      New Password *
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      required={isChangingPassword}
                      className="stocky-input"
                      minLength={8}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirm_password" className="stocky-label">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      required={isChangingPassword}
                      className="stocky-input"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="stocky-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="stocky-button-primary"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
