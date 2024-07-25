import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import ProductDetails from './pages/ProductDetails';
import LoginPage from './pages/Loginpage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import UserProfile from './pages/UserProfile';
import SellerDashboard from './pages/SellerDashboard';
import Navbar from './components/Navbar';
import AddProductPage from './pages/AddProductPage';
import SearchPage from './pages/SearchPage';
import ThankYouPage from './pages/ThankYouPage'; // Nueva importación
import axios from 'axios';

const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/products')
      .then(response => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = decodeJWT(token);
      setIsLoggedIn(true);
      setUser(decodedUser);
    }
  }, []);

  const handleSearch = (searchTerm) => {
    const filtered = products.filter(product => 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleLogin = (user, token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} onSearch={handleSearch} />
      <Routes>
        <Route path="/" element={<HomePage products={filteredProducts} />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/search" element={<SearchPage products={filteredProducts} />} />
        <Route path="/thank-you" element={<ThankYouPage />} /> {/* Nueva ruta */}
      </Routes>
    </Router>
  );
};

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export default App;
