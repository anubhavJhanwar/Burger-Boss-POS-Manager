import { firebaseService } from '../services/firebaseService.js';

export const comboController = {
  async getAllCombos(req, res) {
    try {
      const combos = await firebaseService.getAll('combos');
      res.json({ success: true, data: combos });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createCombo(req, res) {
    try {
      const { name, price, items, type = 'fixed' } = req.body;
      const combo = await firebaseService.create('combos', {
        name,
        price: parseFloat(price),
        items, // [{ menuItemId, menuItemName, quantity }]
        type,
        isActive: true,
      });
      res.json({ success: true, data: combo });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateCombo(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.price) updates.price = parseFloat(updates.price);
      await firebaseService.update('combos', id, updates);
      res.json({ success: true, message: 'Combo updated' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async deleteCombo(req, res) {
    try {
      const { id } = req.params;
      await firebaseService.delete('combos', id);
      res.json({ success: true, message: 'Combo deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};
