// =================================================================
// SERVICE: api.js
// Handles frontend network requests using Axios. Intercepts outgoing
// requests to inject JWT authorization tokens from localStorage.
// =================================================================

import axios from 'axios';

// Default Backend URL
const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT Bearer Token if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch generic authorization error states
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear local storage and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// API MAPPINGS FOR MVC VIEW ACTIONS
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const carAPI = {
  // Fetches paginated cars list with parameters (search, type, sort, page, limit)
  getCars: (params) => api.get('/cars', { params }),
  getCarById: (id) => api.get(`/cars/${id}`),
  createCar: (carData) => api.post('/cars', carData),
  updateCar: (id, carData) => api.put(`/cars/${id}`, carData),
  deleteCar: (id) => api.delete(`/cars/${id}`),
};

export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBooking: (id, updateData) => api.put(`/bookings/${id}`, updateData),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  makeUserAdmin: (id) => api.put(`/admin/users/${id}/admin`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const uploadAPI = {
  uploadLicense: (formData) => {
    return api.post('/upload/license', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadCarImage: (formData) => {
    return api.post('/upload/car-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
export { API_BASE_URL };
