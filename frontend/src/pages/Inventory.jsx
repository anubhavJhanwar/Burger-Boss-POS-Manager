import React, { useState, useEffect } from 'react';
import { getInventory, addInventoryItem, addPurchase, addRecipe, getRecipes, getMenu } from '../services/api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invRes, recRes, menuRes] = await Promise.all([
        getInventory(),
        getRecipes(),
        getMenu(),
      ]);
      setInventory(invRes.data.data);
      setRecipes(recRes.data.data);
      setMenu(menuRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await addInventoryItem({
        ingredient: formData.get('ingredient'),
        stock: formData.get('stock'),
        unit: formData.get('unit'),
      });
      setShowAddModal(false);
      loadData();
    } catch (error) {
      alert('Failed to add item');
    }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await addPurchase({
        ingredient: formData.get('ingredient'),
        quantity: formData.get('quantity'),
        cost: formData.get('cost'),
      });
      setShowPurchaseModal(false);
      loadData();
      alert('Purchase logged successfully!');
    } catch (error) {
      alert('Failed to log purchase');
    }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ingredientsStr = formData.get('ingredients');
    
    // Parse ingredients: "aloo_patty:1,bun:1"
    const ingredients = {};
    ingredientsStr.split(',').forEach(pair => {
      const [key, value] = pair.trim().split(':');
      ingredients[key] = parseFloat(value);
    });

    try {
      await addRecipe({
        menuItemName: formData.get('menuItemName'),
        ingredients,
      });
      setShowRecipeModal(false);
      loadData();
      alert('Recipe added successfully!');
    } catch (error) {
      alert('Failed to add recipe');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
            Add Item
          </button>
          <button onClick={() => setShowPurchaseModal(true)} className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 border border-gray-300 transition-all">
            Log Purchase
          </button>
          <button onClick={() => setShowRecipeModal(true)} className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 border border-gray-300 transition-all">
            Add Recipe
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'inventory' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'recipes' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Recipes
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-700 font-semibold">Ingredient</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Stock</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Unit</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-800">{item.ingredient}</td>
                  <td className="text-right py-3">
                    <span className={item.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-800'}>{item.stock}</span>
                  </td>
                  <td className="text-right py-3 text-gray-600">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 space-y-4">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">{recipe.menuItemName}</h3>
              <div className="text-sm text-gray-600">
                {Object.entries(recipe.ingredients).map(([ing, qty]) => (
                  <span key={ing} className="mr-4">
                    {ing}: {qty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Inventory Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input name="ingredient" placeholder="Ingredient name" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              <input name="stock" type="number" placeholder="Stock" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              <input name="unit" placeholder="Unit (pcs, kg, etc)" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              <div className="flex gap-2">
                <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1">Add</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Log Purchase</h2>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <select name="ingredient" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required>
                <option value="">Select ingredient</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.ingredient}>{item.ingredient}</option>
                ))}
              </select>
              <input name="quantity" type="number" placeholder="Quantity" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              <input name="cost" type="number" placeholder="Cost" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              <div className="flex gap-2">
                <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1">Log</button>
                <button type="button" onClick={() => setShowPurchaseModal(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Recipe</h2>
            <form onSubmit={handleAddRecipe} className="space-y-4">
              <select name="menuItemName" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required>
                <option value="">Select menu item</option>
                {menu.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
              <textarea
                name="ingredients"
                placeholder="Ingredients (format: aloo_patty:1,bun:1)"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                rows="3"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1">Add</button>
                <button type="button" onClick={() => setShowRecipeModal(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
