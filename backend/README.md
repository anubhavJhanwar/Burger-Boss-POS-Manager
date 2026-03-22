# Backend API

Node.js + Express backend for Cafe POS system

## Setup

```bash
npm install
```

## Configuration

Create `.env` file:
```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Email Setup (Optional)

To enable welcome email functionality:

1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Add EMAIL_USER and EMAIL_PASSWORD to .env

**Note:** If email is not configured, signup will still work successfully. The login credentials will be displayed in the terminal console and shown to the user on the success screen. Email functionality is completely optional.

## Run

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account (email, name, PIN)
- `POST /api/auth/login` - Login with email and PIN

### Menu
- `GET /api/menu` - Get menu items
- `POST /api/menu/upload` - Upload menu from Excel
- `POST /api/menu` - Add menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/today` - Get today's orders
- `GET /api/orders/stats` - Get statistics

### Inventory
- `GET /api/inventory` - Get inventory
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update stock
- `POST /api/inventory/purchase` - Log purchase
- `POST /api/inventory/recipe` - Add recipe mapping
- `GET /api/inventory/recipes` - Get all recipes

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses/today` - Get today's expenses
- `DELETE /api/expenses/:id` - Delete expense
