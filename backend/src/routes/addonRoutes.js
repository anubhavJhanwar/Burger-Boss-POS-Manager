import express from 'express';
import { addonController } from '../controllers/addonController.js';

const router = express.Router();

router.get('/', addonController.getAllAddons);
router.post('/', addonController.createAddon);
router.put('/:id', addonController.updateAddon);
router.delete('/:id', addonController.deleteAddon);

export default router;
