import express from 'express';
import { menuController } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', menuController.getAllItems);
router.post('/upload', menuController.uploadMenu);
router.post('/', menuController.addItem);
router.put('/:id', menuController.updateItem);
router.delete('/:id', menuController.deleteItem);

export default router;
