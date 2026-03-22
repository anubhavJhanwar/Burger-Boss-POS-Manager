import express from 'express';
import { orderController } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.post('/:id/unlock', orderController.unlockOrder);
router.post('/payment', orderController.processPayment);
router.get('/', orderController.getAllOrders);
router.get('/pending', orderController.getPendingOrders);
router.get('/completed', orderController.getCompletedOrders);
router.get('/today', orderController.getTodayOrders);
router.get('/stats', orderController.getStats);

export default router;
