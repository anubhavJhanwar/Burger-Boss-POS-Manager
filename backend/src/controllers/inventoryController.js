import { firebaseService } from '../services/firebaseService.js';

export const inventoryController = {
  // Get all inventory items
  async getAllItems(req, res) {
    try {
      const items = await firebaseService.getAll('inventory');
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Add inventory item
  async addItem(req, res) {
    try {
      const { ingredient, stock, unit } = req.body;
      const item = await firebaseService.create('inventory', {
        ingredient,
        stock: parseFloat(stock),
        unit: unit || 'pcs',
      });
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Update inventory stock
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const item = await firebaseService.update('inventory', id, {
        stock: parseFloat(stock),
      });
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Add purchase (increase stock)
  async addPurchase(req, res) {
    try {
      const { ingredient, quantity, cost } = req.body;

      // Find inventory item
      const items = await firebaseService.query('inventory', [
        { field: 'ingredient', operator: '==', value: ingredient }
      ]);

      if (items.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Ingredient not found in inventory' 
        });
      }

      const inventoryItem = items[0];
      const newStock = inventoryItem.stock + parseFloat(quantity);

      // Update inventory
      await firebaseService.update('inventory', inventoryItem.id, {
        stock: newStock,
      });

      // Log purchase
      await firebaseService.create('purchases', {
        ingredient,
        quantity: parseFloat(quantity),
        cost: parseFloat(cost),
        date: new Date().toISOString(),
      });

      res.json({ 
        success: true, 
        data: { ingredient, newStock } 
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Add/Update recipe mapping
  async addRecipe(req, res) {
    try {
      const { menuItemName, ingredients } = req.body;
      
      // Check if recipe exists
      const existing = await firebaseService.query('recipes', [
        { field: 'menuItemName', operator: '==', value: menuItemName }
      ]);

      let recipe;
      if (existing.length > 0) {
        recipe = await firebaseService.update('recipes', existing[0].id, {
          ingredients,
        });
      } else {
        recipe = await firebaseService.create('recipes', {
          menuItemName,
          ingredients,
        });
      }

      res.json({ success: true, data: recipe });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get all recipes
  async getAllRecipes(req, res) {
    try {
      const recipes = await firebaseService.getAll('recipes');
      res.json({ success: true, data: recipes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
