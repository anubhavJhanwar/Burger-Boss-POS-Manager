import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';

const CartPanel = ({ cart, onUpdateQuantity, onRemove, onPlaceOrder, inventoryWarnings = [] }) => {
  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const addonsTotal = item.addons ? item.addons.reduce((addonSum, addon) => addonSum + addon.price, 0) * item.quantity : 0;
    return sum + itemTotal + addonsTotal;
  }, 0);
  const tax = 0;
  const total = subtotal + tax;
  
  const hasLowInventory = inventoryWarnings.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-[420px] flex flex-col">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Cart</h2>
        <p className="text-sm text-gray-500">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
      </div>

      {/* Cart Items - Scrollable when needed */}
      <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3">
        {/* Inventory Warning */}
        {hasLowInventory && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800 text-sm">Low Inventory Warning</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Some ingredients are low or unavailable, but the order can still be placed.
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {inventoryWarnings.map((warning, idx) => (
                <div key={idx} className="text-xs text-yellow-800 flex justify-between">
                  <span>{warning.name}</span>
                  <span className="font-medium">
                    {warning.stock <= 0 ? `${warning.stock} left` : `Only ${warning.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <ShoppingBag className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-400 text-sm">Your cart is empty</p>
          </div>
        ) : (
          cart.map((item) => {
            const itemPrice = item.price * item.quantity;
            const addonsPrice = item.addons ? item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity : 0;
            const totalPrice = itemPrice + addonsPrice;

            return (
              <div 
                key={item.cartId} 
                className="bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Item Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                      {item.name}
                    </h4>
                    {item.addons && item.addons.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.addons.map((addon, idx) => (
                          <p key={idx} className="text-xs text-gray-600">
                            + {addon.name} (₹{addon.price})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => onRemove(item.cartId)} 
                    className="text-red-500 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus size={14} className="text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-800 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      title="Increase quantity"
                    >
                      <Plus size={14} className="text-gray-600" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-800">₹{totalPrice}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Section - Always visible at bottom */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {/* Order Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">₹{subtotal}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span className="font-medium">₹{tax}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-300">
              <span>Total</span>
              <span className="text-orange-600">₹{total}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={onPlaceOrder}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold text-base hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
