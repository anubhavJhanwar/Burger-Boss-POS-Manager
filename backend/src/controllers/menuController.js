import { firebaseService } from '../services/firebaseService.js';
import { validateMenuData } from '../utils/excelParser.js';

export const menuController = {
  // Get all menu items
  async getAllItems(req, res) {
    try {
      const items = await firebaseService.getAll('menu');
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Upload menu from Excel (receives parsed data from frontend)
  async uploadMenu(req, res) {
    try {
      const { items } = req.body;
      const validatedItems = validateMenuData(items);

      // Bulk insert menu items
      const promises = validatedItems.map(item => 
        firebaseService.create('menu', item)
      );
      const results = await Promise.all(promises);

      res.json({ success: true, data: results, count: results.length });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Add single menu item
  async addItem(req, res) {
    try {
      const { name, price, category } = req.body;
      const item = await firebaseService.create('menu', {
        name,
        price: parseFloat(price),
        category,
        available: true,
      });
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Update menu item
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const item = await firebaseService.update('menu', id, updates);
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Delete menu item
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      await firebaseService.delete('menu', id);
      res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};
