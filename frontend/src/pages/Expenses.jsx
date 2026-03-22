import React, { useState, useEffect } from 'react';
import { getExpenses, addExpense, deleteExpense } from '../services/api';
import { X, Plus, Trash2 } from 'lucide-react';
import ToastContainer from '../components/ToastContainer';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';

const Expenses = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const presetExpenses = [
    'Milk',
    'Buns',
    'Aloo Patty',
    'Veg Patty',
    'Paneer',
    'Vegetables',
    'Oil',
    'Cheese',
    'Sauce',
    'Gas Cylinder',
    'Packaging',
    'Rent',
    'Salary',
    'Electricity',
    'Water',
    'Maintenance',
    'Cleaning Supplies',
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await getExpenses();
      setExpenses(response.data.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      addToast('Failed to load expenses', 'error');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!expenseName.trim()) {
      addToast('Please enter expense name', 'warning');
      return;
    }

    try {
      await addExpense({
        category: expenseName,
        amount: parseFloat(formData.get('amount')),
        description: formData.get('notes') || '',
        date: formData.get('date') || new Date().toISOString(),
      });
      setShowModal(false);
      setExpenseName('');
      loadExpenses();
      e.target.reset();
      addToast('Expense added successfully', 'success');
    } catch (error) {
      addToast('Failed to add expense', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      loadExpenses();
      setConfirmDelete(null);
      addToast('Expense deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete expense', 'error');
    }
  };

  const filteredSuggestions = presetExpenses.filter(item =>
    item.toLowerCase().includes(expenseName.toLowerCase())
  );

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="text-2xl font-bold mb-4 text-gray-800">
          Total: <span className="text-red-600">₹{totalExpenses}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-700 font-semibold">Date</th>
                <th className="text-left py-3 text-gray-700 font-semibold">Expense Name</th>
                <th className="text-left py-3 text-gray-700 font-semibold">Notes</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Amount</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No expenses recorded yet
                  </td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-800">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-800 font-medium">{expense.category}</td>
                    <td className="py-3 text-gray-600">{expense.description || '-'}</td>
                    <td className="text-right py-3 text-gray-800 font-medium">₹{expense.amount}</td>
                    <td className="text-right py-3">
                      <button 
                        onClick={() => setConfirmDelete(expense.id)} 
                        className="text-red-600 hover:text-red-700 font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Expense</h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setExpenseName('');
                  setShowSuggestions(false);
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Name
                </label>
                <input
                  type="text"
                  value={expenseName}
                  onChange={(e) => {
                    setExpenseName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Type or select expense name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
                
                {showSuggestions && expenseName && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setExpenseName(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-orange-50 transition-colors text-gray-800"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  placeholder="Add any additional notes"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1"
                >
                  Add Expense
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setExpenseName('');
                    setShowSuggestions(false);
                  }} 
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This action cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default Expenses;
