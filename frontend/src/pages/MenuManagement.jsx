import React, { useState, useEffect } from 'react';
import { getMenu, uploadMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';
import { parseMenuExcel } from '../utils/excelReader';

const MenuManagement = () => {
  const [menu, setMenu] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await getMenu();
      setMenu(response.data.data);
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const items = await parseMenuExcel(file);
      await uploadMenu(items);
      alert(`Successfully uploaded ${items.length} items!`);
      loadMenu();
    } catch (error) {
      alert('Failed to upload menu: ' + error.message);
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
      } else {
        await addMenuItem({
          name: formData.get('name'),
          price: parseFloat(formData.get('price')),
          category: formData.get('category'),
        });
      }
      setShowAddModal(false);
      setEditItem(null);
      loadMenu();
    } catch (error) {
      alert('Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      try {
        await deleteMenuItem(id);
        loadMenu();
      } catch (error) {
        alert('Failed to delete item');
      }
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setShowAddModal(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
        <div className="flex gap-2">
          <label className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 border border-gray-300 transition-all cursor-pointer">
            {uploading ? 'Uploading...' : 'Upload Excel'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <button onClick={() => { setEditItem(null); setShowAddModal(true); }} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
            Add Item
          </button>
        </div>
      </div>

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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="text-right py-3 space-x-2">
                  <button onClick={() => openEditModal(item)} className="text-orange-600 hover:text-orange-700 font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editItem ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input
                name="name"
                defaultValue={editItem?.name}
                placeholder="Item name"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={editItem?.price}
                placeholder="Price"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <input
                name="category"
                defaultValue={editItem?.category}
                placeholder="Category"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              {editItem && (
                <select name="available" defaultValue={editItem.available} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              )}
              <div className="flex gap-2">
                <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex-1">
                  {editItem ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditItem(null); }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
