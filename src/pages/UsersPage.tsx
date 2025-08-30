import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, authAPI } from '../services/api';
import type { User } from '../types/api';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { parseValidationErrors, getGeneralErrorMessage } from '../utils/errorHandling';
import { canPerformAction } from '../utils/permissions';
import { usePageTitle } from '../utils/usePageTitle';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface UserFormData {
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member' | 'scanner' | 'read_only';
  password?: string;
}

export default function UsersPage() {
  usePageTitle('Users');
  
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    full_name: '',
    role: 'member',
    password: ''
  });

  // Get current user for admin check
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.getCurrentUser(),
    retry: 1
  });

  // Fetch users data
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getUsers(1, 100), // Get first 100 users
    retry: 1,
    enabled: currentUser?.role === 'admin' // Only fetch if user is admin
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Permission checks (user management typically requires admin)
  const canCreate = canPerformAction(currentUser?.role, 'create') && isAdmin;
  // Note: canEdit and canDelete would be used for individual action buttons if implemented
  // const canEdit = canPerformAction(currentUser?.role, 'edit') && isAdmin;
  // const canDelete = canPerformAction(currentUser?.role, 'delete') && isAdmin;

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: Partial<User>) => usersAPI.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddForm(false);
      setIsEditMode(false);
      setEditingUser(null);
      setFormErrors([]);
      resetForm();
    },
    onError: (error) => {
      const validationErrors = parseValidationErrors(error);
      setFormErrors(validationErrors);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddForm(false);
      setIsEditMode(false);
      setEditingUser(null);
      setFormErrors([]);
      resetForm();
    },
    onError: (error) => {
      const validationErrors = parseValidationErrors(error);
      setFormErrors(validationErrors);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => usersAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      // For delete errors, we could show a toast or alert instead of form errors
      const errorMessage = getGeneralErrorMessage(error);
      alert(`Failed to delete user: ${errorMessage}`);
    }
  });

  // Filter users based on search term
  const allUsers: User[] = Array.isArray(usersData) 
    ? usersData 
    : usersData?.items || [];
  
  const filteredUsers = allUsers.filter((user: User) => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      role: 'member',
      password: ''
    });
    setFormErrors([]);
  };

  const handleAddStart = () => {
    setEditingUser(null);
    setIsEditMode(false);
    resetForm();
    setShowAddForm(true);
  };

  const handleEditStart = (user: User) => {
    setEditingUser(user);
    setIsEditMode(true);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      password: '' // Don't pre-fill password for security
    });
    setShowAddForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      username: formData.username,
      email: formData.email,
      full_name: formData.full_name,
      role: formData.role
    };

    // Only include password if it's provided
    if (formData.password && formData.password.trim() !== '') {
      submitData.password = formData.password;
    }

    if (isEditMode && editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: submitData });
    } else {
      // Password is required for new users
      if (!formData.password || formData.password.trim() === '') {
        alert('Password is required for new users');
        return;
      }
      createUserMutation.mutate(submitData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }
    
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'scanner': return 'bg-green-100 text-green-800';
      case 'read_only': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return ShieldCheckIcon;
      case 'member': return UserIcon;
      case 'scanner': return UserIcon;
      case 'read_only': return UserIcon;
      default: return UserIcon;
    }
  };

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage users and their roles in the system
          </p>
        </div>
        
        <div className="stocky-card p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-500">
                You need administrator privileges to access user management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Unable to load users data</p>
        <p className="text-sm">{usersError.message || 'Please check your connection to the backend'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage users and their roles in the system
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleAddStart}
            className="stocky-button-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="stocky-card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users by username, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="stocky-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: User) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.username} • {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditStart(user)}
                          className="stocky-icon-button"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="stocky-icon-button-danger"
                          title="Delete"
                          disabled={user.id === currentUser?.id}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search.' : 'Get started by adding a new user.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditMode ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setIsEditMode(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Error Display */}
              <ErrorDisplay errors={formErrors} className="mb-4" />
              
              <form onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="stocky-label">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="stocky-input"
                      placeholder="Enter username"
                    />
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
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="full_name" className="stocky-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="stocky-input"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="stocky-label">
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="stocky-input"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="scanner">Scanner</option>
                      <option value="read_only">Read Only</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="password" className="stocky-label">
                      Password {!isEditMode && '*'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditMode}
                      className="stocky-input"
                      placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setIsEditMode(false);
                      setEditingUser(null);
                    }}
                    className="stocky-button-secondary"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="stocky-button-primary"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  >
                    {isEditMode 
                      ? (updateUserMutation.isPending ? 'Updating...' : 'Update User')
                      : (createUserMutation.isPending ? 'Adding...' : 'Add User')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
