import React from 'react';
import { useLocation } from 'react-router-dom';

const ThankYouPage = () => {
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };

  return (
    <div className="thank-you-container">
      <h1>Thank You for Your Purchase!</h1>
      <h2>Purchased Items:</h2>
      <div className="purchased-items">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.product_id} className="purchased-item">
              <img src={`http://localhost:3000${item.image_url[0]}`} alt={item.product_name} className="purchased-item-image" />
              <div className="purchased-item-details">
                <p><strong>{item.product_name}</strong></p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.price}</p>
                <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
    </div>
  );
};

export default ThankYouPage;
