import React, { useState, useEffect } from 'react';
import { getMenu, uploadMenu, addMenuItem, updateMenuItem, deleteMenuItem, getCombos, createCombo, updateCombo, deleteCombo } from '../services/api';
import { parseMenuExcel } from '../utils/excelReader';
import { Plus, Trash2, X } from 'lucide-react';
import ToastContainer from '../components/ToastContainer';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';

const MenuManagement = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('menu');
  const [menu, setMenu] = useState([]);
  const [combos, setCombos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showComboModal, setShowComboModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editCombo, setEditCombo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteCombo, setConfirmDeleteCombo] = useState(null);

  // Combo form state
  const [comboName, setComboName] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [comboType, setComboType] = useState('fixed');
  const [comboItems, setComboItems] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [selectedMenuItemQty, setSelectedMenuItemQty] = useState(1);

  useEffect(() => {
    loadMenu();
    loadCombos();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await getMenu();
      setMenu(response.data.data);
    } catch (error) {
      addToast('Failed to load menu', 'error');
    }
  };

  const loadCombos = async () => {
    try {
      const response = await getCombos();
      setCombos(response.data.data);
    } catch (error) {
      addToast('Failed to load combos', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const items = await parseMenuExcel(file);
      await uploadMenu(items);
      addToast(`Uploaded ${items.length} items successfully`, 'success');
      loadMenu();
    } catch (error) {
      addToast('Failed to upload menu: ' + error.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      if (editItem) {
        await updateMenuItem(editItem.id, {
          name: formData.get('name'),
          price: parseFloat(formData.get('price')),
          category: formData.get('category'),
          available: formData.get('available') === 'true',
        });
        addToast('Item updated', 'success');
      } else {
        await addMenuItem({
          name: formData.get('name'),
          price: parseFloat(formData.get('price')),
          category: formData.get('category'),
        });
        addToast('Item added', 'success');
      }
      setShowAddModal(false);
      setEditItem(null);
      loadMenu();
    } catch (error) {
      addToast('Failed to save item', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      addToast('Item deleted', 'success');
      loadMenu();
    } catch (error) {
      addToast('Failed to delete item', 'error');
    }
    setConfirmDelete(null);
  };

  // Combo helpers
  const openAddComboModal = () => {
    setEditCombo(null);
    setComboName('');
    setComboPrice('');
    setComboType('fixed');
    setComboItems([]);
    setSelectedMenuItemId('');
    setSelectedMenuItemQty(1);
    setShowComboModal(true);
  };

  const openEditComboModal = (combo) => {
    setEditCombo(combo);
    setComboName(combo.name);
    setComboPrice(combo.price);
    setComboType(combo.type || 'fixed');
    setComboItems(combo.items || []);
    setSelectedMenuItemId('');
    setSelectedMenuItemQty(1);
    setShowComboModal(true);
  };

  const addComboItem = () => {
    if (!selectedMenuItemId) return;
    const menuItem = menu.find(m => m.id === selectedMenuItemId);
    if (!menuItem) return;
    // Prevent duplicates
    if (comboItems.find(ci => ci.menuItemId === selectedMenuItemId)) {
      addToast('Item already added to combo', 'warning');
      return;
    }
    setComboItems([...comboItems, {
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      quantity: parseInt(selectedMenuItemQty) || 1,
    }]);
    setSelectedMenuItemId('');
    setSelectedMenuItemQty(1);
  };

  const removeComboItem = (menuItemId) => {
    setComboItems(comboItems.filter(ci => ci.menuItemId !== menuItemId));
  };

  const handleSaveCombo = async () => {
    if (!comboName.trim() || !comboPrice || comboItems.length === 0) {
      addToast('Please fill all fields and add at least one item', 'warning');
      return;
    }
    try {
      const payload = { name: comboName.trim(), price: comboPrice, items: comboItems, type: comboType };
      if (editCombo) {
        await updateCombo(editCombo.id, payload);
        addToast('Combo updated', 'success');
      } else {
        await createCombo(payload);
        addToast('Combo created', 'success');
      }
      setShowComboModal(false);
      loadCombos();
    } catch (error) {
      addToast('Failed to save combo', 'error');
    }
  };

  const handleDeleteCombo = async (id) => {
    try {
      await deleteCombo(id);
      addToast('Combo deleted', 'success');
      loadCombos();
    } catch (error) {
      addToast('Failed to delete combo', 'error');
    }
    setConfirmDeleteCombo(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
        {activeTab === 'menu' && (
          <div className="flex gap-2">
            <label className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 border border-gray-300 transition-all cursor-pointer">
              {uploading ? 'Uploading...' : 'Upload Excel'}
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
            <button onClick={() => { setEditItem(null); setShowAddModal(true); }} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
              Add Item
            </button>
          </div>
        )}
        {activeTab === 'combos' && (
          <button onClick={openAddComboModal} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
            Create Combo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'menu' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Menu Items ({menu.length})
        </button>
        <button
          onClick={() => setActiveTab('combos')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'combos' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Combos ({combos.length})
        </button>
      </div>

      {/* Menu Items Tab */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-700 font-semibold">Name</th>
                <th className="text-left py-3 text-gray-700 font-semibold">Category</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Price</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Status</th>
                <th className="text-right py-3 text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-800">{item.name}</td>
                  <td className="py-3 text-gray-600">{item.category}</td>
                  <td className="text-right py-3 text-gray-800 font-medium">₹{item.price}</td>
                  <td className="text-right py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="text-right py-3 space-x-2">
                    <button onClick={() => { setEditItem(item); setShowAddModal(true); }} className="text-orange-600 hover:text-orange-700 font-medium">Edit</button>
                    <button onClick={() => setConfirmDelete(item.id)} className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Combos Tab */}
      {activeTab === 'combos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.length === 0 ? (
            <div className="col-span-3 bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <p className="text-gray-500">No combos yet. Create your first combo meal.</p>
            </div>
          ) : (
            combos.map(combo => (
              <div key={combo.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{combo.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{combo.type || 'fixed'}</span>
                  </div>
                  <span className="text-orange-600 font-bold text-lg">₹{combo.price}</span>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Includes:</p>
                  <div className="flex flex-wrap gap-1">
                    {(combo.items || []).map((ci, idx) => (
                      <span key={idx} className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                        {ci.menuItemName} ×{ci.quantity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditComboModal(combo)} className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-all">Edit</button>
                  <button onClick={() => setConfirmDeleteCombo(combo.id)} className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium transition-all">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Menu Item Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editItem ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input name="name" defaultValue={editItem?.name} placeholder="Item name" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              <input name="price" type="number" step="0.01" defaultValue={editItem?.price} placeholder="Price" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              <input name="category" defaultValue={editItem?.category} placeholder="Category" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              {editItem && (
                <select name="available" defaultValue={editItem.available} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              )}
              <div className="flex gap-2">
                <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1">{editItem ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => { setShowAddModal(false); setEditItem(null); }} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Combo Create/Edit Modal */}
      {showComboModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editCombo ? 'Edit Combo' : 'Create Combo'}</h2>
              <button onClick={() => setShowComboModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <input
                value={comboName}
                onChange={e => setComboName(e.target.value)}
                placeholder="Combo name (e.g. Burger Meal)"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="number"
                value={comboPrice}
                onChange={e => setComboPrice(e.target.value)}
                placeholder="Combo price"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <select
                value={comboType}
                onChange={e => setComboType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="fixed">Fixed Combo</option>
                <option value="daily">Daily Special</option>
              </select>

              {/* Add items to combo */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="font-semibold text-gray-700">Add Items to Combo</p>
                <div className="flex gap-2">
                  <select
                    value={selectedMenuItemId}
                    onChange={e => setSelectedMenuItemId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  >
                    <option value="">Select menu item...</option>
                    {menu.filter(m => m.available).map(m => (
                      <option key={m.id} value={m.id}>{m.name} — ₹{m.price}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={selectedMenuItemQty}
                    onChange={e => setSelectedMenuItemQty(e.target.value)}
                    className="w-16 px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm text-center"
                  />
                  <button onClick={addComboItem} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition-all">
                    <Plus size={18} />
                  </button>
                </div>

                {/* Current combo items */}
                {comboItems.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {comboItems.map((ci, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-800">{ci.menuItemName} <span className="text-gray-500">×{ci.quantity}</span></span>
                        <button onClick={() => removeComboItem(ci.menuItemId)} className="text-red-500 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveCombo} className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                  {editCombo ? 'Update Combo' : 'Create Combo'}
                </button>
                <button onClick={() => setShowComboModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Item"
          message="Are you sure you want to delete this menu item?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          type="danger"
        />
      )}

      {confirmDeleteCombo && (
        <ConfirmModal
          title="Delete Combo"
          message="Are you sure you want to delete this combo?"
          onConfirm={() => handleDeleteCombo(confirmDeleteCombo)}
          onCancel={() => setConfirmDeleteCombo(null)}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default MenuManagement;
