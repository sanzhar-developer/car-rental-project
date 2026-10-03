import api from './api';

const paymentService = {
  // Pay for booking (USER only)
  async payForBooking(bookingId, paymentMethod = 'CREDIT_CARD') {
    try {
      const response = await api.put(`/api/payments/bookings/${bookingId}/pay`, {
        paymentMethod
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Pay remaining 80% (USER only)
  async payRemaining(bookingId, paymentMethod = 'CREDIT_CARD') {
    try {
      const response = await api.put(`/api/payments/bookings/${bookingId}/pay-remaining`, {
        paymentMethod
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default paymentService;
