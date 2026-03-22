import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import OrdersPOS from './pages/OrdersPOS';
import PendingOrders from './pages/PendingOrders';
import InventoryNew from './pages/InventoryNew';
import Expenses from './pages/Expenses';
import History from './pages/History';
import MenuManagement from './pages/MenuManagement';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('cafeUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('cafeUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cafeUser');
  };

  return (
    <BrowserRouter>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup onSignup={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/pos" element={user ? <OrdersPOS user={user} /> : <Navigate to="/login" />} />
        <Route path="/orders" element={user ? <PendingOrders /> : <Navigate to="/login" />} />
        <Route path="/menu" element={user ? <MenuManagement /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={user ? <InventoryNew /> : <Navigate to="/login" />} />
        <Route path="/expenses" element={user ? <Expenses /> : <Navigate to="/login" />} />
        <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
