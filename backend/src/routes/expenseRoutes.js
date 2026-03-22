import express from 'express';
import { expenseController } from '../controllers/expenseController.js';

const router = express.Router();

router.get('/', expenseController.getAllExpenses);
router.post('/', expenseController.addExpense);
router.get('/today', expenseController.getTodayExpenses);
router.delete('/:id', expenseController.deleteExpense);

export default router;
