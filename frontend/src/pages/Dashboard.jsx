import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { getTodayOrders, getExpenses, getCompletedOrders } from '../services/api';
import { Trophy } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    todaySales: 0,
    topItems: [],
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

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
    </div>
  );
};

export default Dashboard;
