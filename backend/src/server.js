import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import addonRoutes from './routes/addonRoutes.js';
import { firebaseService } from './services/firebaseService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/addons', addonRoutes);

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, pin } = req.body;
    
    if (!pin || pin.length < 4) {
      return res.status(400).json({ 
        success: false, 
        error: 'PIN must be at least 4 digits' 
      });
    }

    // Check if email already exists
    const existingUsers = await firebaseService.query('users', [
      { field: 'email', operator: '==', value: email }
    ]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    const user = await firebaseService.create('users', {
      name,
      email,
      pin, // In production, hash this!
    });

    // Send email with credentials (async, don't wait)
    sendWelcomeEmail(email, name, pin).catch(err => 
      console.error('Email send failed:', err)
    );

    res.json({ success: true, data: { id: user.id, name, email } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, pin } = req.body;
    
    const users = await firebaseService.query('users', [
      { field: 'email', operator: '==', value: email },
      { field: 'pin', operator: '==', value: pin }
    ]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or PIN' 
      });
    }

    const user = users[0];
    res.json({ 
      success: true, 
      data: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete user account and all related data
app.delete('/api/auth/delete-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user's orders
    const orders = await firebaseService.query('orders', [
      { field: 'userId', operator: '==', value: userId }
    ]);
    for (const order of orders) {
      await firebaseService.delete('orders', order.id);
    }

    // Delete user's expenses
    const expenses = await firebaseService.getAll('expenses');
    for (const expense of expenses) {
      await firebaseService.delete('expenses', expense.id);
    }

    // Delete user's inventory
    const inventory = await firebaseService.getAll('inventory');
    for (const item of inventory) {
      await firebaseService.delete('inventory', item.id);
    }

    // Delete user's recipes
    const recipes = await firebaseService.getAll('recipes');
    for (const recipe of recipes) {
      await firebaseService.delete('recipes', recipe.id);
    }

    // Delete user's menu items
    const menu = await firebaseService.getAll('menu');
    for (const item of menu) {
      await firebaseService.delete('menu', item.id);
    }

    // Delete user's purchases
    const purchases = await firebaseService.getAll('purchases');
    for (const purchase of purchases) {
      await firebaseService.delete('purchases', purchase.id);
    }

    // Finally, delete the user
    await firebaseService.delete('users', userId);

    res.json({ 
      success: true, 
      message: 'Account and all related data deleted successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Email sending function
async function sendWelcomeEmail(email, name, pin) {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
      process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.log('⚠️  Email not configured. Skipping welcome email.');
    console.log(`📧 Login credentials for ${email}:`);
    console.log(`   Email: ${email}`);
    console.log(`   PIN: ${pin}`);
    return;
  }

  const nodemailer = await import('nodemailer');
  
  // Create transporter (configure with your email service)
  const transporter = nodemailer.default.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to BurgerBoss POS System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Welcome to BurgerBoss!</h2>
        <p>Hi ${name},</p>
        <p>Your account has been successfully created. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>PIN:</strong> ${pin}</p>
        </div>
        <p>You can now log in to your account and start managing your cafe operations.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Keep your PIN secure and do not share it with anyone.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.log(`📧 Login credentials for ${email}:`);
    console.log(`   Email: ${email}`);
    console.log(`   PIN: ${pin}`);
    // Don't throw error - signup should succeed even if email fails
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cafe POS API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
