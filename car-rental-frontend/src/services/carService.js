import api from './api';

const carService = {
  async getAllCars() {
    try {
      const response = await api.get('/api/cars');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getCarById(id) {
    try {
      const response = await api.get(`/api/cars/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getAvailableCars(startDate, endDate) {
    try {
      const response = await api.get('/api/cars/available', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createCar(carData) {
    try {
      const response = await api.post('/api/cars', carData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update car (ADMIN only)
  async updateCar(id, carData) {
    try {
      const response = await api.put(`/api/cars/${id}`, carData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete car (ADMIN only)
  async deleteCar(id) {
    try {
      await api.delete(`/api/cars/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default carService;
