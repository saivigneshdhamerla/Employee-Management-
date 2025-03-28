import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { logout } from '../features/auth/authSlice';
import { 
  fetchUsersStart, fetchUsersSuccess, fetchUsersFailure, 
  setCurrentPage, setEditingUser,
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserStart, deleteUserSuccess, deleteUserFailure,
  setSearchTerm, setFilter, clearFilters, selectFilterOptions
} from '../features/users/usersSlice';
import EditUserModal from '../components/EditUserModal';

export default function Users() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    users, filteredUsers, currentPage, totalPages, loading, error,
    searchTerm, filters
  } = useSelector((state) => state.users);
  
  const filterOptions = useSelector(selectFilterOptions);

  const fetchUsers = async (page) => {
    dispatch(fetchUsersStart());
    try {
      const response = await api.get(`/users?page=${page}`);
      dispatch(fetchUsersSuccess(response.data));
    } catch (err) {
      dispatch(fetchUsersFailure(err.message));
      toast.error(err.message);
    }
  };

  const handleEdit = (user) => {
    dispatch(setEditingUser(user));
  };

  const handleUpdate = async (updatedUser) => {
    dispatch(updateUserStart());
    try {
      const response = await api.put(`/users/${updatedUser.id}`, updatedUser);
      dispatch(updateUserSuccess(response.data));
      toast.success('User updated successfully');
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      toast.error(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUserStart());
      try {
        await api.delete(`/users/${userId}`);
        dispatch(deleteUserSuccess(userId));
        toast.success('User deleted successfully');
      } catch (err) {
        dispatch(deleteUserFailure(err.message));
        toast.error(err.message);
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleFilter = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { 
      y: 20, 
      opacity: 0,
      scale: 0.9,
      rotate: -2
    },
    show: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        mass: 0.5
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: -10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}
      />
      <div className="max-w-7xl mx-auto relative">
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1F2937',
              color: '#E5E7EB',
              border: '1px solid rgba(75, 85, 99, 0.5)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#1F2937',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#1F2937',
              },
            },
          }}
        />
        
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 select-none">
            Employees
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-6 py-2.5 border border-gray-700 text-sm font-medium rounded-full text-gray-200 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transform transition-all duration-200 hover:scale-105 shadow-lg shadow-gray-900/50"
          >
            Logout
          </button>
        </motion.div>
        
        {/* Search and Filter Section */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="mb-8 space-y-4"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={filters.department}
              onChange={(e) => handleFilter('department', e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleFilter('location', e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Locations</option>
              {filterOptions.locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {(searchTerm || Object.values(filters).some(Boolean)) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <XMarkIcon className="h-5 w-5 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {loading && !users.length ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                variants={item}
                layoutId={`user-${user.id}`}
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group min-h-[400px] border border-gray-700/50"
                style={{
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ 
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                />
                <div className="relative p-8">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-6">
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <img
                        src={user.avatar}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-700 shadow-lg"
                      />
                    </motion.div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-purple-400 hover:bg-gray-700/50 rounded-full transition-colors duration-200 hover:scale-110 transform"
                        disabled={loading}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-400 hover:bg-gray-700/50 rounded-full transition-colors duration-200 hover:scale-110 transform"
                        disabled={loading}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* User Info Section */}
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors duration-200">
                        {user.first_name} {user.last_name}
                      </h2>
                      <p className="text-gray-400 mt-1">{user.email}</p>
                    </div>

                    {/* Additional User Details */}
                    <div className="space-y-4 pt-4 border-t border-gray-700/50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Department</p>
                          <p className="text-base text-gray-200">{user.department}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">Role</p>
                          <p className="text-base text-gray-200">{user.role}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-400">Location</p>
                        <p className="text-base text-gray-200">{user.location}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Active Projects</p>
                          <p className="text-base text-gray-200">{user.projects}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">Pending Tasks</p>
                          <p className="text-base text-gray-200">{user.tasks}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-400">Join Date</p>
                        <p className="text-base text-gray-200">{user.joinDate}</p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-end pt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${user.status === 'Active' ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 
                            user.status === 'On Leave' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                            user.status === 'Remote' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/50' :
                            'bg-purple-900/30 text-purple-400 border border-purple-500/50'}`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">
              No users found matching your search criteria
            </p>
          </motion.div>
        )}

        {filteredUsers.length > 0 && (
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="mt-12 flex justify-center space-x-2"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => dispatch(setCurrentPage(page))}
                disabled={loading}
                className={`px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-900/50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:shadow border border-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </motion.div>
        )}

        <EditUserModal onSubmit={handleUpdate} />
      </div>
    </motion.div>
  );
}