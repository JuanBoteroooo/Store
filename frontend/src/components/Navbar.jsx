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
      <div className="nav-left">
        <ul>
          <li>
            <Link to="/">
              <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7" />
                <path d="M9 22V12H5v10" />
                <path d="M19 22V12h-4v10" />
              </svg>
            </Link>
          </li>
          {isLoggedIn && user && user.profile === 'seller' && (
            <li>
              <Link to="/seller">
                <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </Link>
            </li>
          )}
          <li>
            <Link to="/cart">
              <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
          </li>
        </ul>
      </div>
      <div className="search-bar">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>
      <div className="nav-right">
        <ul>
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/profile">
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.24 12.24a8 8 0 1 1-8.48-8.48" />
                    <line x1="12" y1="12" x2="22" y2="22" />
                  </svg>
                </Link>
              </li>
              <li>
                <button onClick={handleLogout}>
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4.79a1 1 0 0 1 .21 2H15a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4.79a1 1 0 0 1 .21 2H15a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
                    <line x1="15" y1="12" x2="21" y2="12" />
                    <line x1="18" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register">
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                    <path d="M8 11h8" />
                    <path d="M8 15h4" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link to="/login">
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4.79a1 1 0 0 1 .21 2H15a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4.79a1 1 0 0 1 .21 2H15a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
                    <line x1="15" y1="12" x2="21" y2="12" />
                    <line x1="18" y1="9" x2="18" y2="15" />
                  </svg>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
