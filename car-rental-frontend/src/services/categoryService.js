import api from './api';

const categoryService = {
  // Get all categories
  async getAllCategories() {
    try {
      const response = await api.get('/api/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get category by ID
  async getCategoryById(id) {
    try {
      const response = await api.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create category (ADMIN only)
  async createCategory(name, description) {
    try {
      const response = await api.post('/api/categories', {
        name,
        description,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update category (ADMIN only)
  async updateCategory(id, name, description) {
    try {
      const response = await api.put(`/api/categories/${id}`, {
        name,
        description,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete category (ADMIN only)
  async deleteCategory(id) {
    try {
      await api.delete(`/api/categories/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default categoryService;
