import React, { useState, useEffect } from 'react';
import { getIngredients, addIngredient, updateIngredient, deleteIngredient, getAllRecipes, saveRecipe, deleteRecipe, getMenu, getAddons, createAddon, updateAddon, deleteAddon } from '../services/api';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import ToastContainer from '../components/ToastContainer';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';

const InventoryNew = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [menu, setMenu] = useState([]);
  const [addons, setAddons] = useState([]);
  
  // Modals
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingAddon, setEditingAddon] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Recipe builder state
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState([
    { ingredientId: '', quantity: 1 }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ingredientsRes, recipesRes, menuRes, addonsRes] = await Promise.all([
        getIngredients(),
        getAllRecipes(),
        getMenu(),
        getAddons(),
      ]);
      setIngredients(ingredientsRes.data.data);
      setRecipes(recipesRes.data.data);
      setMenu(menuRes.data.data);
      setAddons(addonsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await addIngredient({
        name: formData.get('name'),
        unit: formData.get('unit'),
        stock: formData.get('stock') || 0,
      });
      setShowAddIngredientModal(false);
      loadData();
      e.target.reset();
      addToast('Ingredient added successfully', 'success');
    } catch (error) {
      addToast('Failed to add ingredient', 'error');
    }
  };

  const handleDeleteIngredient = async (id) => {
    try {
      await deleteIngredient(id);
      loadData();
      setConfirmDelete(null);
      addToast('Ingredient deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete ingredient', 'error');
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await updateIngredient(id, { stock: newStock });
      loadData();
      addToast('Stock updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update stock', 'error');
    }
  };

  // Recipe Builder Functions
  const addIngredientRow = () => {
    setRecipeIngredients([...recipeIngredients, { ingredientId: '', quantity: 1 }]);
  };

  const removeIngredientRow = (index) => {
    const newIngredients = recipeIngredients.filter((_, i) => i !== index);
    setRecipeIngredients(newIngredients);
  };

  const updateIngredientRow = (index, field, value) => {
    const newIngredients = [...recipeIngredients];
    newIngredients[index][field] = value;
    setRecipeIngredients(newIngredients);
  };

  const openRecipeModal = (recipe = null) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setSelectedMenuItem(recipe.menuItemId);
      setRecipeIngredients(recipe.ingredients);
    } else {
      setEditingRecipe(null);
      setSelectedMenuItem('');
      setRecipeIngredients([{ ingredientId: '', quantity: 1 }]);
    }
    setShowRecipeModal(true);
  };

  const handleSaveRecipe = async () => {
    // Validation
    if (!selectedMenuItem) {
      addToast('Please select a menu item', 'warning');
      return;
    }

    const validIngredients = recipeIngredients.filter(
      ing => ing.ingredientId && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      addToast('Please add at least one ingredient', 'warning');
      return;
    }

    // Check for duplicates
    const ingredientIds = validIngredients.map(i => i.ingredientId);
    const uniqueIds = new Set(ingredientIds);
    if (ingredientIds.length !== uniqueIds.size) {
      addToast('Duplicate ingredients not allowed', 'warning');
      return;
    }

    try {
      const menuItem = menu.find(m => m.id === selectedMenuItem);
      await saveRecipe({
        menuItemId: selectedMenuItem,
        menuItemName: menuItem.name,
        ingredients: validIngredients.map(ing => ({
          ingredientId: ing.ingredientId,
          quantity: parseFloat(ing.quantity),
        })),
      });
      setShowRecipeModal(false);
      loadData();
      addToast('Recipe saved successfully', 'success');
    } catch (error) {
      addToast('Failed to save recipe: ' + error.message, 'error');
    }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      await deleteRecipe(id);
      loadData();
      setConfirmDelete(null);
      addToast('Recipe deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete recipe', 'error');
    }
  };

  const getIngredientName = (id) => {
    const ingredient = ingredients.find(i => i.id === id);
    return ingredient ? ingredient.name : 'Unknown';
  };

  // Add-on Functions
  const openAddonModal = (addon = null) => {
    setEditingAddon(addon);
    setShowAddonModal(true);
  };

  const handleSaveAddon = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const addonData = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        inventoryItemId: formData.get('inventoryItemId'),
      };

      if (editingAddon) {
        await updateAddon(editingAddon.id, addonData);
        addToast('Add-on updated successfully', 'success');
      } else {
        await createAddon(addonData);
        addToast('Add-on created successfully', 'success');
      }
      
      setShowAddonModal(false);
      setEditingAddon(null);
      loadData();
    } catch (error) {
      addToast('Failed to save add-on: ' + error.message, 'error');
    }
  };

  const handleDeleteAddon = async (id) => {
    try {
      await deleteAddon(id);
      loadData();
      setConfirmDelete(null);
      addToast('Add-on deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete add-on', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <button
          onClick={() => setShowAddIngredientModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          Add Ingredient
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'ingredients'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Ingredients
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'recipes'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Recipes
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'addons'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Add-ons
        </button>
      </div>

      {/* Ingredients Tab */}
      {activeTab === 'ingredients' && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-700 font-semibold">Ingredient</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Stock</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Unit</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-800">{item.name}</td>
                  <td className="text-right py-3">
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) => handleUpdateStock(item.id, parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                    />
                  </td>
                  <td className="text-right py-3 text-gray-600">{item.unit}</td>
                  <td className="text-right py-3">
                    <button
                      onClick={() => setConfirmDelete({ type: 'ingredient', id: item.id })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <button
            onClick={() => openRecipeModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Add Recipe
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800">{recipe.menuItemName}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openRecipeModal(recipe)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ type: 'recipe', id: recipe.id })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex justify-between">
                      <span>{getIngredientName(ing.ingredientId)}</span>
                      <span className="font-medium">×{ing.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add-ons Tab */}
      {activeTab === 'addons' && (
        <div className="space-y-4">
          <button
            onClick={() => openAddonModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Add Add-on
          </button>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-gray-700 font-semibold">Add-on Name</th>
                  <th className="text-right py-3 text-gray-700 font-semibold">Price</th>
                  <th className="text-right py-3 text-gray-700 font-semibold">Linked Ingredient</th>
                  <th className="text-right py-3 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {addons.map(addon => (
                  <tr key={addon.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">{addon.name}</td>
                    <td className="text-right py-3 text-gray-800">₹{addon.price}</td>
                    <td className="text-right py-3 text-gray-600">
                      {addon.inventoryItemId ? getIngredientName(addon.inventoryItemId) : 'None'}
                    </td>
                    <td className="text-right py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openAddonModal(addon)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ type: 'addon', id: addon.id })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {addons.length === 0 && (
              <p className="text-gray-400 text-center py-8">No add-ons created yet</p>
            )}
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Ingredient</h2>
            <form onSubmit={handleAddIngredient} className="space-y-4">
              <input
                name="name"
                placeholder="Ingredient name (e.g., Bun, Cheese Slice)"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <select
                name="unit"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              >
                <option value="pcs">Pieces</option>
                <option value="grams">Grams</option>
                <option value="ml">Milliliters</option>
                <option value="kg">Kilograms</option>
                <option value="liters">Liters</option>
              </select>
              <input
                name="stock"
                type="number"
                placeholder="Initial stock (optional)"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddIngredientModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Builder Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRecipe ? 'Edit Recipe' : 'Add Recipe'}
              </h2>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Menu Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Item
                </label>
                <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                >
                  <option value="">Select menu item</option>
                  {menu.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ingredients Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients
                </label>
                <div className="space-y-2">
                  {recipeIngredients.map((ing, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <select
                        value={ing.ingredientId}
                        onChange={(e) => updateIngredientRow(index, 'ingredientId', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        <option value="">Select ingredient</option>
                        {ingredients.map(ingredient => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => updateIngredientRow(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        min="0.1"
                        step="0.1"
                        className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <button
                        onClick={() => removeIngredientRow(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                        disabled={recipeIngredients.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addIngredientRow}
                  className="mt-2 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Plus size={18} />
                  Add Ingredient
                </button>
              </div>

              {/* Recipe Preview */}
              {recipeIngredients.some(ing => ing.ingredientId) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Recipe Preview</h3>
                  <div className="space-y-1">
                    {recipeIngredients
                      .filter(ing => ing.ingredientId)
                      .map((ing, idx) => (
                        <div key={idx} className="text-sm text-gray-700 flex justify-between">
                          <span>{getIngredientName(ing.ingredientId)}</span>
                          <span className="font-medium">×{ing.quantity}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveRecipe}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1"
                >
                  {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
                </button>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add-on Modal */}
      {showAddonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAddon ? 'Edit Add-on' : 'Add Add-on'}
              </h2>
              <button
                onClick={() => setShowAddonModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveAddon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add-on Name
                </label>
                <input
                  name="name"
                  defaultValue={editingAddon?.name || ''}
                  placeholder="e.g., Extra Cheese Slice"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingAddon?.price || ''}
                  placeholder="e.g., 15"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Inventory Item
                </label>
                <select
                  name="inventoryItemId"
                  defaultValue={editingAddon?.inventoryItemId || ''}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                >
                  <option value="">Select ingredient</option>
                  {ingredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1"
                >
                  {editingAddon ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddonModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <ConfirmModal
          title={`Delete ${confirmDelete.type.charAt(0).toUpperCase() + confirmDelete.type.slice(1)}`}
          message={`Are you sure you want to delete this ${confirmDelete.type}?`}
          onConfirm={() => {
            if (confirmDelete.type === 'ingredient') handleDeleteIngredient(confirmDelete.id);
            else if (confirmDelete.type === 'recipe') handleDeleteRecipe(confirmDelete.id);
            else if (confirmDelete.type === 'addon') handleDeleteAddon(confirmDelete.id);
          }}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default InventoryNew;
