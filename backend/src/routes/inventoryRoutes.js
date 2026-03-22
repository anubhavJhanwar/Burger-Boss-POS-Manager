import express from 'express';
import { inventoryController } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', inventoryController.getAllItems);
router.post('/', inventoryController.addItem);
router.put('/:id', inventoryController.updateStock);
router.post('/purchase', inventoryController.addPurchase);
router.post('/recipe', inventoryController.addRecipe);
router.get('/recipes', inventoryController.getAllRecipes);

export default router;
