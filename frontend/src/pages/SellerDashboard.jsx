import React from 'react';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  return (
    <div>
      <h1>Seller Dashboard</h1>
      <Link to="/add-product">Add Product</Link>
    </div>
  );
};

export default SellerDashboard;
