import React, { useState, useEffect } from 'react';
import { getCompletedOrders } from '../services/api';

const History = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getCompletedOrders();
      setOrders(response.data.data.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)));
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const getOrderNumber = (order) => {
    return order.id.slice(-6).toUpperCase();
  };

  const getPaymentMethodLabel = (order) => {
    if (order.paymentMethod === 'split') {
      return `Split (₹${order.cashAmount} Cash + ₹${order.onlineAmount} Online)`;
    }
    return order.paymentMethod === 'cash' ? 'Cash' : 'Online';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Order History</h1>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 text-gray-700 font-semibold">Order #</th>
              <th className="text-left py-3 text-gray-700 font-semibold">Items</th>
              <th className="text-left py-3 text-gray-700 font-semibold">Payment</th>
              <th className="text-right py-3 text-gray-700 font-semibold">Total</th>
              <th className="text-right py-3 text-gray-700 font-semibold">Time</th>
              <th className="text-right py-3 text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-800 font-medium">#{getOrderNumber(order)}</td>
                <td className="py-3 text-gray-600">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </td>
                <td className="py-3 text-gray-600">{getPaymentMethodLabel(order)}</td>
                <td className="text-right py-3 text-gray-800 font-medium">₹{order.totalAmount}</td>
                <td className="text-right py-3 text-gray-600">
                  {new Date(order.paidAt).toLocaleTimeString()}
                </td>
                <td className="text-right py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Order #{getOrderNumber(selectedOrder)}</h2>
            <div className="space-y-3">
              <p className="text-gray-700"><strong>Date:</strong> {new Date(selectedOrder.paidAt).toLocaleString()}</p>
              <p className="text-gray-700"><strong>Payment:</strong> {getPaymentMethodLabel(selectedOrder)}</p>
              <p className="text-gray-700"><strong>Status:</strong> <span className="text-green-600">Completed</span></p>
              <div>
                <strong className="text-gray-700">Items:</strong>
                <ul className="mt-2 space-y-1">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx} className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-800">{item.name} ×{item.quantity}</span>
                        <span className="text-gray-800 font-medium">₹{item.price * item.quantity}</span>
                      </div>
                      {item.addons && item.addons.length > 0 && (
                        <div className="ml-4 mt-1 text-xs text-gray-600">
                          {item.addons.map((addon, addonIdx) => (
                            <div key={addonIdx}>+ {addon.name} (₹{addon.price})</div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-orange-600">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all w-full mt-4">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
