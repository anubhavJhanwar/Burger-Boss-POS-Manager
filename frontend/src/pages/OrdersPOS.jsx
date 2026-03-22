import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuCard from '../components/MenuCard';
import CartPanel from '../components/CartPanel';
import ToastContainer from '../components/ToastContainer';
import ConfirmModal from '../components/ConfirmModal';
import { getMenu, createOrder, updateOrder, getAddons, getIngredients, getAllRecipes, getCombos } from '../services/api';
import { useToast } from '../hooks/useToast';
import { X, Plus } from 'lucide-react';

const OrdersPOS = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();
  const [menu, setMenu] = useState([]);
  const [addons, setAddons] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [combos, setCombos] = useState([]);
  const [inventoryWarnings, setInventoryWarnings] = useState([]);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [showComboAddonModal, setShowComboAddonModal] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selectedComboAddons, setSelectedComboAddons] = useState([]);

  useEffect(() => {
    loadData();
    
    // Check if we're editing an existing order
    if (location.state?.editOrder) {
      const order = location.state.editOrder;
      setEditingOrder(order);
      // Load cart with existing order items
      const cartItems = order.items.map((item, index) => ({
        ...item,
        cartId: Date.now() + index,
      }));
      setCart(cartItems);
    }
  }, [location.state]);

  const loadData = async () => {
    try {
      const [menuRes, addonsRes, ingredientsRes, recipesRes, combosRes] = await Promise.all([
        getMenu(),
        getAddons(),
        getIngredients(),
        getAllRecipes(),
        getCombos(),
      ]);
      setMenu(menuRes.data.data);
      setAddons(addonsRes.data.data);
      setIngredients(ingredientsRes.data.data);
      setRecipes(recipesRes.data.data);
      setCombos(combosRes.data.data.filter(c => c.isActive !== false));
    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Failed to load data', 'error');
    }
  };

  const categories = ['All', ...new Set(menu.map(item => item.category))];

  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const openComboAddonModal = (combo) => {
    setSelectedCombo(combo);
    setSelectedComboAddons([]);
    setShowComboAddonModal(true);
  };

  const toggleComboAddon = (addon) => {
    if (selectedComboAddons.find(a => a.id === addon.id)) {
      setSelectedComboAddons(selectedComboAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedComboAddons([...selectedComboAddons, addon]);
    }
  };

  const addComboToCart = () => {
    const cartItem = {
      type: 'combo',
      comboId: selectedCombo.id,
      id: selectedCombo.id,
      name: selectedCombo.name,
      price: selectedCombo.price,
      quantity: 1,
      items: selectedCombo.items,
      addons: selectedComboAddons,
      cartId: Date.now(),
    };
    const newCart = [...cart, cartItem];
    setCart(newCart);
    checkInventoryWarnings(newCart);
    setShowComboAddonModal(false);
    setSelectedCombo(null);
    setSelectedComboAddons([]);
    addToast('Combo added to cart', 'success');
  };

  const openAddonModal = (item) => {
    setSelectedItem(item);
    setSelectedAddons([]);
    setShowAddonModal(true);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addToCartWithAddons = () => {
    const itemWithAddons = {
      ...selectedItem,
      addons: selectedAddons,
      cartId: Date.now(),
    };

    const newCart = [...cart, { ...itemWithAddons, quantity: 1 }];
    setCart(newCart);
    checkInventoryWarnings(newCart);
    setShowAddonModal(false);
    setSelectedItem(null);
    setSelectedAddons([]);
    addToast('Item added to cart', 'success');
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      setConfirmRemove(cartId);
    } else {
      const newCart = cart.map(item => item.cartId === cartId ? { ...item, quantity } : item);
      setCart(newCart);
      checkInventoryWarnings(newCart);
    }
  };

  const removeFromCart = (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    setCart(newCart);
    checkInventoryWarnings(newCart);
    setConfirmRemove(null);
    addToast('Item removed from cart', 'info');
  };

  const checkInventoryWarnings = (currentCart) => {
    const warnings = [];
    const ingredientUsage = {};

    // Calculate total ingredient usage from cart
    currentCart.forEach(cartItem => {
      // Find recipe for this menu item
      const recipe = recipes.find(r => r.menuItemName === cartItem.name);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          const key = ing.ingredientId;
          ingredientUsage[key] = (ingredientUsage[key] || 0) + (ing.quantity * cartItem.quantity);
        });
      }

      // Check add-ons inventory
      if (cartItem.addons) {
        cartItem.addons.forEach(addon => {
          const addonData = addons.find(a => a.id === addon.id);
          if (addonData && addonData.inventoryItemId) {
            const key = addonData.inventoryItemId;
            ingredientUsage[key] = (ingredientUsage[key] || 0) + cartItem.quantity;
          }
        });
      }
    });

    // Check against current inventory
    Object.keys(ingredientUsage).forEach(ingredientId => {
      const ingredient = ingredients.find(i => i.id === ingredientId);
      if (ingredient) {
        const remainingStock = ingredient.stock - ingredientUsage[ingredientId];
        if (remainingStock <= 5) {
          warnings.push({
            name: ingredient.name,
            stock: remainingStock,
          });
        }
      }
    });

    setInventoryWarnings(warnings);
  };

  const handlePlaceOrder = async () => {
    try {
      const subtotal = cart.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const addonsTotal = item.addons ? item.addons.reduce((addonSum, addon) => addonSum + addon.price, 0) * item.quantity : 0;
        return sum + itemTotal + addonsTotal;
      }, 0);

      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type || 'item',
          ...(item.type === 'combo' ? { comboId: item.comboId, items: item.items } : {}),
          addons: item.addons || [],
        })),
        subtotal,
        totalAmount: subtotal,
        userId: user.id,
      };

      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData);
        addToast('Order updated successfully!', 'success');
        setCart([]);
        setEditingOrder(null);
        setInventoryWarnings([]);
        navigate('/orders');
      } else {
        await createOrder(orderData);
        addToast('Order placed successfully!', 'success');
        setCart([]);
        setInventoryWarnings([]);
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error with order:', error);
      addToast('Failed to process order', 'error');
    }
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {editingOrder ? `Edit Order #${editingOrder.id.slice(-6).toUpperCase()}` : 'POS - Create Order'}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMenu.map(item => (
              <div key={item.id} onClick={() => openAddonModal(item)}>
                <MenuCard item={item} onAddToCart={() => {}} />
              </div>
            ))}
          </div>

          {/* Combos Section */}
          {combos.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">🍱 Combo Meals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {combos.map(combo => (
                  <div
                    key={combo.id}
                    onClick={() => openComboAddonModal(combo)}
                    className="bg-white rounded-xl shadow-md p-4 border-2 border-orange-100 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800">{combo.name}</h3>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full capitalize">{combo.type || 'fixed'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {(combo.items || []).map(ci => `${ci.menuItemName} ×${ci.quantity}`).join(' + ')}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-orange-600">₹{combo.price}</span>
                      <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">Add</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CartPanel
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={(cartId) => setConfirmRemove(cartId)}
            onPlaceOrder={handlePlaceOrder}
            inventoryWarnings={inventoryWarnings}
          />
        </div>
      </div>

      {/* Confirm Remove Modal */}
      {confirmRemove && (
        <ConfirmModal
          title="Remove Item"
          message="Are you sure you want to remove this item from the cart?"
          onConfirm={() => removeFromCart(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
          confirmText="Remove"
          type="danger"
        />
      )}

      {/* Add-ons Modal */}
      {showAddonModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedItem.name}</h2>
              <button onClick={() => setShowAddonModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-2xl font-bold text-orange-600">₹{selectedItem.price}</p>
            </div>

            {addons.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Add-ons (Optional)</h3>
                <div className="space-y-2">
                  {addons.map(addon => (
                    <label
                      key={addon.id}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddons.find(a => a.id === addon.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedAddons.find(a => a.id === addon.id)}
                          onChange={() => toggleAddon(addon)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-800">{addon.name}</span>
                      </div>
                      <span className="text-orange-600 font-semibold">+₹{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={addToCartWithAddons}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => setShowAddonModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combo Add-ons Modal */}
      {showComboAddonModal && selectedCombo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedCombo.name}</h2>
              <button onClick={() => setShowComboAddonModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-2xl font-bold text-orange-600">₹{selectedCombo.price}</p>
              <p className="text-sm text-gray-500 mt-1">
                Includes: {(selectedCombo.items || []).map(ci => `${ci.menuItemName} ×${ci.quantity}`).join(', ')}
              </p>
            </div>

            {addons.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Add-ons (Optional)</h3>
                <div className="space-y-2">
                  {addons.map(addon => (
                    <label
                      key={addon.id}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedComboAddons.find(a => a.id === addon.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedComboAddons.find(a => a.id === addon.id)}
                          onChange={() => toggleComboAddon(addon)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-800">{addon.name}</span>
                      </div>
                      <span className="text-orange-600 font-semibold">+₹{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={addComboToCart}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => setShowComboAddonModal(false)}
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

export default OrdersPOS;
