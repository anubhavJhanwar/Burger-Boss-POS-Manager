import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const deleteUser = (userId) => api.delete(`/auth/delete-user/${userId}`);

// Menu
export const getMenu = () => api.get('/menu');
export const uploadMenu = (items) => api.post('/menu/upload', { items });
export const addMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const unlockOrder = (id, data) => api.post(`/orders/${id}/unlock`, data);
export const processPayment = (data) => api.post('/orders/payment', data);
export const getOrders = () => api.get('/orders');
export const getPendingOrders = () => api.get('/orders/pending');
export const getCompletedOrders = () => api.get('/orders/completed');
export const getTodayOrders = () => api.get('/orders/today');
export const getOrderStats = () => api.get('/orders/stats');

// Add-ons
export const getAddons = () => api.get('/addons');
export const createAddon = (data) => api.post('/addons', data);
export const updateAddon = (id, data) => api.put(`/addons/${id}`, data);
export const deleteAddon = (id) => api.delete(`/addons/${id}`);

// Inventory
export const getInventory = () => api.get('/inventory');
export const addInventoryItem = (data) => api.post('/inventory', data);
export const updateInventoryStock = (id, stock) => api.put(`/inventory/${id}`, { stock });
export const addPurchase = (data) => api.post('/inventory/purchase', data);
export const addRecipe = (data) => api.post('/inventory/recipe', data);
export const getRecipes = () => api.get('/inventory/recipes');

// Ingredients (New)
export const getIngredients = () => api.get('/ingredients');
export const addIngredient = (data) => api.post('/ingredients', data);
export const updateIngredient = (id, data) => api.put(`/ingredients/${id}`, data);
export const deleteIngredient = (id) => api.delete(`/ingredients/${id}`);
export const saveRecipe = (data) => api.post('/ingredients/recipe', data);
export const getAllRecipes = () => api.get('/ingredients/recipes');
export const deleteRecipe = (id) => api.delete(`/ingredients/recipe/${id}`);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const addExpense = (data) => api.post('/expenses', data);
export const getTodayExpenses = () => api.get('/expenses/today');
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Admin
export const resetDatabase = () => api.delete('/admin/reset-data');

export default api;
