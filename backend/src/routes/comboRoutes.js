import express from 'express';
import { comboController } from '../controllers/comboController.js';

const router = express.Router();

router.get('/', comboController.getAllCombos);
router.post('/', comboController.createCombo);
router.put('/:id', comboController.updateCombo);
router.delete('/:id', comboController.deleteCombo);

export default router;
