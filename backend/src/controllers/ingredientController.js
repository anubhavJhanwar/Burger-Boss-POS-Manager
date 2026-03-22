import { firebaseService } from '../services/firebaseService.js';

export const ingredientController = {
  // Get all ingredients
  async getAllIngredients(req, res) {
    try {
      const ingredients = await firebaseService.getAll('inventory_items');
      res.json({ success: true, data: ingredients });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Add ingredient
  async addIngredient(req, res) {
    try {
      const { name, unit, stock } = req.body;
      const ingredient = await firebaseService.create('inventory_items', {
        name,
        unit: unit || 'pcs',
        stock: parseFloat(stock) || 0,
      });
      res.json({ success: true, data: ingredient });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Update ingredient stock
  async updateIngredient(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const ingredient = await firebaseService.update('inventory_items', id, {
        stock: parseFloat(stock),
      });
      res.json({ success: true, data: ingredient });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Delete ingredient
  async deleteIngredient(req, res) {
    try {
      const { id } = req.params;
      await firebaseService.delete('inventory_items', id);
      res.json({ success: true, message: 'Ingredient deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Add/Update recipe
  async saveRecipe(req, res) {
    try {
      const { menuItemId, menuItemName, ingredients } = req.body;

      // Validate ingredients
      if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Recipe must have at least one ingredient' 
        });
      }

      // Check for duplicates
      const ingredientIds = ingredients.map(i => i.ingredientId);
      const uniqueIds = new Set(ingredientIds);
      if (ingredientIds.length !== uniqueIds.size) {
        return res.status(400).json({ 
          success: false, 
          error: 'Duplicate ingredients not allowed' 
        });
      }

      // Check if recipe exists
      const existing = await firebaseService.query('recipes', [
        { field: 'menuItemId', operator: '==', value: menuItemId }
      ]);

      let recipe;
      if (existing.length > 0) {
        recipe = await firebaseService.update('recipes', existing[0].id, {
          menuItemName,
          ingredients,
        });
      } else {
        recipe = await firebaseService.create('recipes', {
          menuItemId,
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

  // Delete recipe
  async deleteRecipe(req, res) {
    try {
      const { id } = req.params;
      await firebaseService.delete('recipes', id);
      res.json({ success: true, message: 'Recipe deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};
