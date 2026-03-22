import { firebaseService } from '../services/firebaseService.js';
import { db } from '../config/firebase.js';

export const orderController = {
  // Create new order (pending status)
  async createOrder(req, res) {
    try {
      const { items, subtotal, totalAmount, userId } = req.body;

      const order = await firebaseService.create('orders', {
        items,
        subtotal: subtotal || totalAmount,
        totalAmount,
        userId,
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: null,
        locked: false,
        createdAt: new Date().toISOString(),
      });

      res.json({ 
        success: true, 
        data: order
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Update order (only if not locked)
  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const { items, subtotal, totalAmount } = req.body;

      const order = await firebaseService.getById('orders', id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      if (order.locked) {
        return res.status(403).json({ success: false, error: 'Order is locked and cannot be edited' });
      }

      if (order.paymentStatus === 'paid') {
        return res.status(403).json({ success: false, error: 'Cannot edit paid orders' });
      }

      await firebaseService.update('orders', id, {
        items,
        subtotal: subtotal || totalAmount,
        totalAmount,
        updatedAt: new Date().toISOString(),
      });

      res.json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Unlock order with PIN verification
  async unlockOrder(req, res) {
    try {
      const { id } = req.params;
      const { userId, pin } = req.body;

      // Get user and verify PIN
      const user = await firebaseService.getById('users', userId);
      if (!user || user.pin !== pin) {
        return res.status(401).json({ success: false, error: 'Invalid PIN' });
      }

      await firebaseService.update('orders', id, {
        locked: false,
        unlockedAt: new Date().toISOString(),
        unlockedBy: userId,
      });

      res.json({ success: true, message: 'Order unlocked successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Process payment and complete order
  async processPayment(req, res) {
    try {
      const { orderId, paymentMethod, cashAmount, onlineAmount } = req.body;

      // Get order
      const order = await firebaseService.getById('orders', orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      // Start batch for atomic operations
      const batch = db.batch();

      // Update order status
      const orderRef = db.collection('orders').doc(orderId);
      batch.update(orderRef, {
        orderStatus: 'completed',
        paymentStatus: 'paid',
        paymentMethod,
        cashAmount: cashAmount || 0,
        onlineAmount: onlineAmount || 0,
        locked: true,
        paidAt: new Date().toISOString(),
      });

      // Deduct inventory based on recipes and add-ons
      for (const item of order.items) {
        // Get recipe for this menu item
        const recipes = await firebaseService.query('recipes', [
          { field: 'menuItemName', operator: '==', value: item.name }
        ]);

        if (recipes.length > 0) {
          const recipe = recipes[0];
          
          // Deduct recipe ingredients
          for (const recipeIngredient of recipe.ingredients) {
            const { ingredientId, quantity } = recipeIngredient;
            const ingredient = await firebaseService.getById('inventory_items', ingredientId);
            
            if (ingredient) {
              const newStock = ingredient.stock - (quantity * item.quantity);
              const inventoryRef = db.collection('inventory_items').doc(ingredientId);
              batch.update(inventoryRef, { stock: newStock });
            }
          }
        }

        // Deduct add-ons inventory
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            const addonData = await firebaseService.getById('addons', addon.id);
            if (addonData && addonData.inventoryItemId) {
              const ingredient = await firebaseService.getById('inventory_items', addonData.inventoryItemId);
              if (ingredient) {
                const newStock = ingredient.stock - item.quantity;
                const inventoryRef = db.collection('inventory_items').doc(addonData.inventoryItemId);
                batch.update(inventoryRef, { stock: newStock });
              }
            }
          }
        }
      }

      // Create transaction record
      const transactionRef = db.collection('transactions').doc();
      batch.set(transactionRef, {
        orderId,
        amount: order.totalAmount,
        paymentMethod,
        cashAmount: cashAmount || 0,
        onlineAmount: onlineAmount || 0,
        createdAt: new Date().toISOString(),
      });

      // Commit batch
      await batch.commit();

      res.json({ 
        success: true, 
        message: 'Payment processed successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get all orders
  async getAllOrders(req, res) {
    try {
      const orders = await firebaseService.getAll('orders');
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get pending orders
  async getPendingOrders(req, res) {
    try {
      const orders = await firebaseService.query('orders', [
        { field: 'orderStatus', operator: '==', value: 'pending' }
      ]);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get completed orders
  async getCompletedOrders(req, res) {
    try {
      const orders = await firebaseService.query('orders', [
        { field: 'orderStatus', operator: '==', value: 'completed' }
      ]);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get today's orders
  async getTodayOrders(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const orders = await firebaseService.query('orders', [
        { field: 'createdAt', operator: '>=', value: todayISO }
      ]);

      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get order statistics
  async getStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const todayOrders = await firebaseService.query('orders', [
        { field: 'createdAt', operator: '>=', value: todayISO },
        { field: 'paymentStatus', operator: '==', value: 'paid' }
      ]);

      const totalSales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = todayOrders.length;

      // Calculate top selling items
      const itemCounts = {};
      todayOrders.forEach(order => {
        order.items.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      });

      const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      res.json({
        success: true,
        data: {
          totalSales,
          totalOrders,
          topItems,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
