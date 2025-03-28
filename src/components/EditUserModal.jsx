import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { closeEditModal } from '../features/users/usersSlice';

export default function EditUserModal({ onSubmit }) {
  const dispatch = useDispatch();
  const { isEditModalOpen, editingUser, loading, error } = useSelector((state) => state.users);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingUser) {
      setFormData({
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
      });
      setErrors({}); // Clear errors when modal opens
    }
  }, [editingUser]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [loading]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // Prevent multiple submissions

    if (!validateForm()) return;

    try {
      await onSubmit({ ...formData, id: editingUser.id });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save changes. Please try again.'
      }));
    }
  };

  const handleClose = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (loading) return; // Prevent closing while loading

    try {
      dispatch(closeEditModal());
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  };

  const modalVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      rotateX: -15
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      rotateX: 15,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    hidden: { 
      y: 20, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const renderInput = (name, label, type = 'text') => (
    <motion.div 
      variants={inputVariants}
      className="relative"
    >
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        disabled={loading}
        className={`block w-full px-4 py-3 rounded-lg shadow-sm text-base 
          ${loading ? 'bg-gray-800/30 cursor-not-allowed' : 'bg-gray-800/50'}
          backdrop-blur-sm border
          ${errors[name] 
            ? 'border-red-500/50 text-red-400 placeholder-red-400/50 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-700/50 text-gray-100 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500'
          }
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
          disabled:opacity-50`}
        required
      />
      <AnimatePresence>
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {errors[name]}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isEditModalOpen && (
        <Dialog
          static
          open={isEditModalOpen}
          onClose={() => !loading && handleClose()}
          className="relative z-50"
        >
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <Dialog.Panel
              as={motion.div}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ perspective: 1000 }}
              className="relative mx-auto max-w-lg w-full rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-2xl border border-gray-700/50 overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"
                animate={{
                  opacity: [0, 1, 0],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
              />

              <motion.button
                onClick={handleClose}
                disabled={loading}
                className={`absolute right-4 top-4 p-2 rounded-full text-gray-400 
                  ${loading ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-300 hover:bg-gray-800/50'}
                  transition-colors duration-200`}
                whileHover={!loading ? { scale: 1.1, rotate: 90 } : {}}
                whileTap={!loading ? { scale: 0.9 } : {}}
              >
                <XMarkIcon className="h-5 w-5" />
              </motion.button>

              <Dialog.Title
                as={motion.h3}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6"
              >
                Edit Employee Details
              </Dialog.Title>

              <AnimatePresence>
                {(error || errors.submit) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg overflow-hidden"
                  >
                    <span className="block sm:inline">{error || errors.submit}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  className="space-y-6 pb-6"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {renderInput('first_name', 'First Name')}
                  {renderInput('last_name', 'Last Name')}
                  {renderInput('email', 'Email Address', 'email')}
                </motion.div>

                <motion.div 
                  className="flex justify-end space-x-3"
                  variants={inputVariants}
                >
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium text-gray-300 
                      ${loading 
                        ? 'bg-gray-800/30 cursor-not-allowed' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50 hover:shadow-lg hover:shadow-black/50'}
                      border border-gray-700/50 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 
                      transition-all duration-200`}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white 
                      bg-gradient-to-r from-purple-500 to-pink-500
                      ${!loading && 'hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-900/50'}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200`}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  delay: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}