import api from './api';

const penaltyService = {
  async getAllPenalties() {
    try {
      const response = await api.get('/api/penalties');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get my penalties (USER only)
  async getMyPenalties() {
    try {
      const response = await api.get('/api/penalties/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Pay penalty (USER only)
  async payPenalty(id) {
    try {
      const response = await api.put(`/api/penalties/${id}/pay`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create traffic fine (ADMIN/MANAGER only)
  async createTrafficFine(bookingId) {
    try {
      const response = await api.post(`/api/penalties/bookings/${bookingId}/traffic-fine`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default penaltyService;
