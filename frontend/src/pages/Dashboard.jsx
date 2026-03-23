import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { getTodayOrders, getExpenses, getCompletedOrders } from '../services/api';
import { Trophy } from 'lucide-react';

const CATEGORY_COLORS = {
  'Raw Materials': 'bg-orange-400',
  'Utilities':     'bg-blue-400',
  'Staff':         'bg-green-400',
  'Misc':          'bg-purple-400',
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || 'bg-gray-400';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({ todaySales: 0, topItems: [] });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [allExpenses, setAllExpenses] = useState([]);
  const [expenseFilter, setExpenseFilter] = useState('overall'); // 'today' | 'overall'

  useEffect(() => {
    loadData();
    
    // Poll for updates every 5 seconds for real-time feel
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [todayOrdersRes, expensesRes, allPaidOrdersRes] = await Promise.all([
        getTodayOrders(),
        getExpenses(),
        getCompletedOrders(),
      ]);
      
      const todayOrders = todayOrdersRes.data.data;
      const allExpenses = expensesRes.data.data;
      const allPaidOrders = allPaidOrdersRes.data.data;
      
      // Filter today's paid orders for sales calculation
      const todayPaidOrders = todayOrders.filter(order => order.paymentStatus === 'paid');
      const todaySales = todayPaidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Calculate top selling items from today's paid orders
      const itemCounts = {};
      todayPaidOrders.forEach(order => {
        order.items.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      });

      const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      setStats({
        todaySales,
        topItems,
      });
      
      // Calculate total expenses from all expenses
      const expensesTotal = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(expensesTotal);
      setAllExpenses(allExpenses);
      
      // Calculate all-time sales from all paid orders
      const allTimeSales = allPaidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      setTotalSales(allTimeSales);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  // Compute expense breakdown based on filter
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredExpenses = expenseFilter === 'today'
    ? allExpenses.filter(e => (e.date || e.createdAt || '').startsWith(todayStr))
    : allExpenses;

  const categoryBreakdown = filteredExpenses.reduce((acc, exp) => {
    const cat = exp.category || 'Misc';
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Today's Sales" value={`₹${stats.todaySales}`} icon="💰" color="green-600" />
        <DashboardCard title="Total Sales" value={`₹${totalSales}`} icon="📊" color="blue-600" />
        <DashboardCard title="Total Expenses" value={`₹${totalExpenses}`} icon="💸" color="red-600" />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Top 3 Selling Items Today</h2>
        </div>
        {stats.topItems.length > 0 ? (
          <div className="space-y-3">
            {stats.topItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMedalEmoji(index)}</span>
                  <span className="font-semibold text-gray-800">{item.name}</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{item.count} sold</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No orders yet today</p>
        )}
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Expense Breakdown</h2>
            {topCategory && (
              <p className="text-sm text-gray-500 mt-0.5">
                Top: <span className="font-semibold text-orange-600">{topCategory[0]}</span> — ₹{topCategory[1]}
              </p>
            )}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setExpenseFilter('today')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${expenseFilter === 'today' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Today
            </button>
            <button
              onClick={() => setExpenseFilter('overall')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${expenseFilter === 'overall' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Overall
            </button>
          </div>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No expenses recorded</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat)}`} />
                  <span className="text-gray-700 font-medium">{cat}</span>
                </div>
                <span className="font-semibold text-gray-800">₹{amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
