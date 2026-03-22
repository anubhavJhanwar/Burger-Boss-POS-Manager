import { firebaseService } from '../services/firebaseService.js';

export const addonController = {
  // Get all add-ons
  async getAllAddons(req, res) {
    try {
      const addons = await firebaseService.getAll('addons');
      res.json({ success: true, data: addons });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Add new add-on
  async createAddon(req, res) {
    try {
      const { name, price, inventoryItemId } = req.body;
      const addon = await firebaseService.create('addons', {
        name,
        price: parseFloat(price),
        inventoryItemId,
      });
      res.json({ success: true, data: addon });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Update add-on
  async updateAddon(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const addon = await firebaseService.update('addons', id, updates);
      res.json({ success: true, data: addon });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Delete add-on
  async deleteAddon(req, res) {
    try {
      const { id } = req.params;
      await firebaseService.delete('addons', id);
      res.json({ success: true, message: 'Add-on deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};
