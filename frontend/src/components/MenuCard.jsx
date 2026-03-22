import React from 'react';

const MenuCard = ({ item, onAddToCart }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer" 
      onClick={() => onAddToCart(item)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">{item.category}</span>
      </div>
      <p className="text-2xl font-bold text-orange-600">₹{item.price}</p>
      {!item.available && <p className="text-red-500 text-sm mt-2 font-medium">Out of Stock</p>}
    </div>
  );
};

export default MenuCard;
