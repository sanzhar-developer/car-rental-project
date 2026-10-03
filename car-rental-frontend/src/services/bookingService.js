import api from './api';

const bookingService = {
  // Create booking (USER only)
  async createBooking(carId, startDate, endDate, privacyPolicyAccepted, instantRent = false) {
    try {
      const response = await api.post('/api/bookings', {
        carId,
        startDate,
        endDate,
        privacyPolicyAccepted,
        instantRent
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get my bookings (USER only)
  async getMyBookings() {
    try {
      const response = await api.get('/api/bookings/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get booking by ID
  async getBookingById(id) {
    try {
      const response = await api.get(`/api/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get booking detail by ID (ADMIN only)
  async getBookingDetailById(id) {
    try {
      const response = await api.get(`/api/bookings/${id}/detail`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel booking (USER only)
  async cancelBooking(id) {
    try {
      await api.delete(`/api/bookings/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Start rental (ADMIN only)
  async startRental(id) {
    try {
      const response = await api.put(`/api/bookings/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Complete booking (ADMIN only)
  // This now sets car status to INSPECTION according to backend logic
  async completeBooking(id, actualReturnDate) {
    try {
      const response = await api.put(`/api/bookings/${id}/complete`, null, {
        params: { actualReturnDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Complete inspection (ADMIN only)
  async completeInspection(carId, status, damageFine = 0) {
    try {
      const response = await api.put(`/api/bookings/cars/${carId}/inspection`, null, {
        params: { status, damageFine }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default bookingService;

