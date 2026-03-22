import * as XLSX from 'xlsx';

// Parse Excel file and return menu items
export const parseMenuExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Transform to expected format
        const items = json.map(row => ({
          name: row.name || row.Name,
          price: parseFloat(row.price || row.Price),
          category: row.category || row.Category,
        }));

        resolve(items);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
