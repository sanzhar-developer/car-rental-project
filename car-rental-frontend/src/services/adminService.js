import api from './api';

const adminService = {
  // Get all bookings
  async getAllBookings() {
    try {
      const response = await api.get('/api/admin/bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get dashboard statistics
  async getDashboardStatistics() {
    try {
      const response = await api.get('/api/admin/statistics/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get revenue statistics
  async getRevenueStatistics(startDate, endDate) {
    try {
      const response = await api.get('/api/admin/statistics/revenue', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Filter cars by status
  async filterCarsByStatus(status) {
    try {
      const response = await api.get('/api/admin/cars/filter', {
        params: { status },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search cars
  async searchCars(query) {
    try {
      const response = await api.get('/api/admin/cars/search', {
        params: { query },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Start Rental (BOOKED -> RENTED) - NEW in Guide 2.0
  async startRental(bookingId) {
    try {
      const response = await api.put(`/api/bookings/${bookingId}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Filter bookings by status
  async filterBookingsByStatus(status) {
    try {
      const response = await api.get('/api/admin/bookings/filter', {
        params: { status },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Complete Inspection (INSPECTION -> AVAILABLE/DAMAGED/PENALTY) - NEW in Guide 2.0
  async completeInspection(carId, status) {
    try {
      const response = await api.put(`/api/bookings/cars/${carId}/inspection`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update Car Status manually - NEW in Guide 2.0
  async updateCarStatus(carId, status) {
    try {
      const response = await api.put(`/api/admin/cars/${carId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all cars for admin (Using /api/admin/cars for full visibility)
  async getAllCars() {
    try {
      const response = await api.get('/api/admin/cars');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get all users (ADMIN only)
  async getAllUsers() {
    try {
      // Try managers first
      const response = await api.get('/api/admin/users/managers');
      return response.data;
    } catch (error) {
      try {
        // Fallback to general users endpoint
        const fallbackResponse = await api.get('/api/admin/users');
        return fallbackResponse.data;
      } catch (innerError) {
        throw error.response?.data || error.message;
      }
    }
  },

  // Create a new manager (ADMIN only)
  async createManager(managerData) {
    try {
      const response = await api.post('/api/admin/users/managers', managerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update manager (ADMIN only)
  async updateManager(id, managerData) {
    try {
      const response = await api.put(`/api/admin/users/managers/${id}`, managerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user (ADMIN only)
  async deleteUser(id) {
    try {
      await api.delete(`/api/admin/users/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default adminService;


