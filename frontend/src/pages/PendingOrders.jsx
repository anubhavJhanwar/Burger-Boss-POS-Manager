import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayOrders, processPayment, unlockOrder } from '../services/api';
import { CreditCard, Banknote, Split, X, Check, Edit, Lock, Unlock } from 'lucide-react';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';

const PendingOrders = ({ user }) => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [onlineAmount, setOnlineAmount] = useState('');
  const [unlockPin, setUnlockPin] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getTodayOrders();
      setOrders(response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const pendingOrders = orders.filter(order => order.paymentStatus === 'unpaid');
  const completedOrders = orders.filter(order => order.paymentStatus === 'paid');

  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setPaymentMethod('cash');
    setCashAmount('');
    setOnlineAmount('');
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedOrder) return;

    if (paymentMethod === 'split') {
      const cash = parseFloat(cashAmount) || 0;
      const online = parseFloat(onlineAmount) || 0;
      if (cash + online !== selectedOrder.totalAmount) {
        addToast(`Total must equal ₹${selectedOrder.totalAmount}`, 'warning');
        return;
      }
    }

    setProcessing(true);
    try {
      await processPayment({
        orderId: selectedOrder.id,
        paymentMethod,
        cashAmount: paymentMethod === 'split' ? parseFloat(cashAmount) : (paymentMethod === 'cash' ? selectedOrder.totalAmount : 0),
        onlineAmount: paymentMethod === 'split' ? parseFloat(onlineAmount) : (paymentMethod === 'online' ? selectedOrder.totalAmount : 0),
      });
      setShowPaymentModal(false);
      setSelectedOrder(null);
      loadOrders();
      addToast('Payment processed successfully!', 'success');
    } catch (error) {
      addToast('Failed to process payment: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditOrder = (order) => {
    if (order.locked) {
      addToast('This order is locked. Please unlock it first.', 'warning');
      return;
    }
    navigate('/pos', { state: { editOrder: order } });
  };

  const openUnlockModal = (order) => {
    setSelectedOrder(order);
    setUnlockPin('');
    setShowUnlockModal(true);
  };

  const handleUnlock = async () => {
    if (!selectedOrder || !unlockPin) {
      addToast('Please enter your PIN', 'warning');
      return;
    }

    setProcessing(true);
    try {
      await unlockOrder(selectedOrder.id, {
        userId: user.id,
        pin: unlockPin,
      });
      setShowUnlockModal(false);
      setSelectedOrder(null);
      setUnlockPin('');
      loadOrders();
      addToast('Order unlocked successfully!', 'success');
    } catch (error) {
      addToast('Failed to unlock order: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getOrderNumber = (order) => {
    return order.id.slice(-6).toUpperCase();
  };

  const getPaymentMethodLabel = (order) => {
    if (order.paymentMethod === 'cash') return 'Cash';
    if (order.paymentMethod === 'online') return 'Online';
    if (order.paymentMethod === 'split') {
      return `Split (₹${order.cashAmount} Cash + ₹${order.onlineAmount} Online)`;
    }
    return 'N/A';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Orders - Today</h1>
          <p className="text-gray-600 mt-1">
            {pendingOrders.length} pending • {completedOrders.length} completed
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pending Orders ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'completed'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Completed Orders ({completedOrders.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <>
          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending Orders</h3>
              <p className="text-gray-600">All orders have been processed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-md p-5 border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Order #{getOrderNumber(order)}</h3>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-semibold text-gray-700">Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>{item.name} ×{item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                        {item.addons && item.addons.length > 0 && (
                          <div className="ml-4 text-xs text-gray-500">
                            {item.addons.map((addon, addonIdx) => (
                              <div key={addonIdx}>+ {addon.name} (₹{addon.price})</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-3 mb-4">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total:</span>
                      <span className="text-orange-600">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => openPaymentModal(order)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Take Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'completed' && (
        <>
          {completedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Completed Orders</h3>
              <p className="text-gray-600">No orders have been completed today</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-md p-5 border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Order #{getOrderNumber(order)}</h3>
                      <p className="text-sm text-gray-500">{new Date(order.paidAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Paid
                      </span>
                      {order.locked && (
                        <Lock className="text-gray-600" size={16} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-semibold text-gray-700">Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>{item.name} ×{item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                        {item.addons && item.addons.length > 0 && (
                          <div className="ml-4 text-xs text-gray-500">
                            {item.addons.map((addon, addonIdx) => (
                              <div key={addonIdx}>+ {addon.name} (₹{addon.price})</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-3 mb-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800 mb-2">
                      <span>Total:</span>
                      <span className="text-green-600">₹{order.totalAmount}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Payment: {getPaymentMethodLabel(order)}
                    </p>
                  </div>

                  {order.locked && (
                    <button
                      onClick={() => openUnlockModal(order)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
                    >
                      <Unlock size={16} />
                      Unlock Order
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Process Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total Amount:</span>
                <span className="text-orange-600">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-gray-700">Select Payment Method:</p>
              
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <Banknote className="text-green-600" size={20} />
                <span className="font-medium text-gray-800">Cash</span>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'online' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <CreditCard className="text-blue-600" size={20} />
                <span className="font-medium text-gray-800">Online</span>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'split' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="split"
                  checked={paymentMethod === 'split'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <Split className="text-purple-600" size={20} />
                <span className="font-medium text-gray-800">Split Payment</span>
              </label>
            </div>

            {paymentMethod === 'split' && (
              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cash Amount</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="₹0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Online Amount</label>
                  <input
                    type="number"
                    value={onlineAmount}
                    onChange={(e) => setOnlineAmount(e.target.value)}
                    placeholder="₹0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Total: ₹{(parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0)} / ₹{selectedOrder.totalAmount}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={processing}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnlockModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Unlock Order</h2>
              <button onClick={() => setShowUnlockModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Enter your PIN to unlock Order #{getOrderNumber(selectedOrder)}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">PIN</label>
              <input
                type="password"
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                placeholder="Enter your PIN"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUnlock}
                disabled={processing || !unlockPin}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {processing ? 'Unlocking...' : 'Unlock'}
              </button>
              <button
                onClick={() => setShowUnlockModal(false)}
                disabled={processing}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
