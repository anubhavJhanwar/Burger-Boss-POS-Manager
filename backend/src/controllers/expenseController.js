import { firebaseService } from '../services/firebaseService.js';

export const expenseController = {
  // Get all expenses
  async getAllExpenses(req, res) {
    try {
      const expenses = await firebaseService.getAll('expenses');
      res.json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Add expense
  async addExpense(req, res) {
    try {
      const { category, amount, description, date } = req.body;
      const expense = await firebaseService.create('expenses', {
        category,
        amount: parseFloat(amount),
        description: description || '',
        date: date || new Date().toISOString(),
      });
      res.json({ success: true, data: expense });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get today's expenses
  async getTodayExpenses(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const expenses = await firebaseService.query('expenses', [
        { field: 'date', operator: '>=', value: todayISO }
      ]);

      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      res.json({ 
        success: true, 
        data: { expenses, total } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Delete expense
  async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      await firebaseService.delete('expenses', id);
      res.json({ success: true, message: 'Expense deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};
