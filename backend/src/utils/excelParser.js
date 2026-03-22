// Excel parsing utility for menu items
// Frontend will parse Excel and send JSON to backend
export const validateMenuData = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  return data.map((item, index) => {
    if (!item.name || !item.price || !item.category) {
      throw new Error(`Invalid data at row ${index + 1}: name, price, and category are required`);
    }

    return {
      name: item.name.trim(),
      price: parseFloat(item.price),
      category: item.category.trim(),
      available: true,
    };
  });
};
