import { createSlice } from '@reduxjs/toolkit';

const departments = ['Engineering', 'Product', 'Marketing', 'Sales', 'Customer Support'];
const roles = {
  Engineering: ['Software Engineer', 'DevOps Engineer', 'QA Engineer', 'Technical Lead'],
  Product: ['Product Manager', 'Product Owner', 'Business Analyst'],
  Marketing: ['Marketing Manager', 'Content Writer', 'SEO Specialist'],
  Sales: ['Sales Representative', 'Account Manager', 'Sales Manager'],
  'Customer Support': ['Support Specialist', 'Customer Success Manager', 'Technical Support']
};
const locations = ['New York, USA', 'London, UK', 'Singapore', 'Sydney, Australia', 'Toronto, Canada'];
const statuses = ['Active', 'On Leave', 'Remote', 'In Meeting'];

const enrichUserData = (user) => ({
  ...user,
  department: departments[Math.floor(Math.random() * departments.length)],
  location: locations[Math.floor(Math.random() * locations.length)],
  status: statuses[Math.floor(Math.random() * statuses.length)],
  get role() {
    const deptRoles = roles[this.department];
    return deptRoles[Math.floor(Math.random() * deptRoles.length)];
  },
  joinDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 2).toISOString().split('T')[0],
  projects: Math.floor(Math.random() * 8) + 1,
  tasks: Math.floor(Math.random() * 15) + 5
});

const filterUsers = (users, { searchTerm, filters }) => {
  return users.filter(user => {
    const matchesSearch = searchTerm ? 
      (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) : true;

    const matchesDepartment = filters.department ? user.department === filters.department : true;
    const matchesStatus = filters.status ? user.status === filters.status : true;
    const matchesLocation = filters.location ? user.location === filters.location : true;

    return matchesSearch && matchesDepartment && matchesStatus && matchesLocation;
  });
};

const initialState = {
  users: [],
  filteredUsers: [],
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  editingUser: null,
  isEditModalOpen: false,
  searchTerm: '',
  filters: {
    department: '',
    status: '',
    location: ''
  }
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload.data.map(enrichUserData);
      state.filteredUsers = filterUsers(state.users, {
        searchTerm: state.searchTerm,
        filters: state.filters
      });
      state.totalPages = action.payload.total_pages;
      state.currentPage = action.payload.page;
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    // Edit actions
    setEditingUser: (state, action) => {
      state.editingUser = action.payload;
      state.isEditModalOpen = true;
    },
    closeEditModal: (state) => {
      state.editingUser = null;
      state.isEditModalOpen = false;
    },
    updateUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action) => {
      state.loading = false;
      state.users = state.users.map(user => 
        user.id === action.payload.id ? action.payload : user
      );
      state.filteredUsers = filterUsers(state.users, {
        searchTerm: state.searchTerm,
        filters: state.filters
      });
      state.isEditModalOpen = false;
      state.editingUser = null;
    },
    updateUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete actions
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action) => {
      state.loading = false;
      state.users = state.users.filter(user => user.id !== action.payload);
      state.filteredUsers = filterUsers(state.users, {
        searchTerm: state.searchTerm,
        filters: state.filters
      });
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Search and filter actions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredUsers = filterUsers(state.users, {
        searchTerm: action.payload,
        filters: state.filters
      });
    },

    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        [action.payload.key]: action.payload.value
      };
      state.filteredUsers = filterUsers(state.users, {
        searchTerm: state.searchTerm,
        filters: state.filters
      });
    },

    clearFilters: (state) => {
      state.searchTerm = '';
      state.filters = {
        department: '',
        status: '',
        location: ''
      };
      state.filteredUsers = state.users;
    }
  },
});

export const { 
  fetchUsersStart, 
  fetchUsersSuccess, 
  fetchUsersFailure,
  setCurrentPage,
  setEditingUser,
  closeEditModal,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  setSearchTerm,
  setFilter,
  clearFilters
} = usersSlice.actions;

export const selectFilterOptions = (state) => ({
  departments: [...new Set(state.users.users.map(user => user.department))],
  statuses: [...new Set(state.users.users.map(user => user.status))],
  locations: [...new Set(state.users.users.map(user => user.location))]
});

export default usersSlice.reducer;