import express from 'express';
import { ingredientController } from '../controllers/ingredientController.js';

const router = express.Router();

// Ingredients
router.get('/', ingredientController.getAllIngredients);
router.post('/', ingredientController.addIngredient);
router.put('/:id', ingredientController.updateIngredient);
router.delete('/:id', ingredientController.deleteIngredient);

// Recipes
router.post('/recipe', ingredientController.saveRecipe);
router.get('/recipes', ingredientController.getAllRecipes);
router.delete('/recipe/:id', ingredientController.deleteRecipe);

export default router;
