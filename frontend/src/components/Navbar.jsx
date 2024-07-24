import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, user, onLogout, onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {isLoggedIn ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            {user && user.profile === 'seller' && <li><Link to="/seller">Seller Dashboard</Link></li>}
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </>
        )}
      </ul>
      <div className="search-bar">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
