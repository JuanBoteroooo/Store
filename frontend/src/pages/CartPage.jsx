import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      console.log('Cart items:', response.data); // Imprimir los datos en la consola para depuración
      setCartItems(response.data);
    })
    .catch(error => {
      console.error('Error fetching cart items:', error);
    });
  };

  const handleRemoveItem = (productId) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:3000/cart/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      fetchCartItems();
    })
    .catch(error => {
      console.error('Error removing item:', error);
    });
  };

  const handleUpdateQuantity = (productId, quantity) => {
    const token = localStorage.getItem('token');
    axios.put(`http://localhost:3000/cart/${productId}`, { quantity: parseInt(quantity) }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      fetchCartItems();
    })
    .catch(error => {
      console.error('Error updating quantity:', error);
    });
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : 'N/A';
  };

  return (
    <div>
      <h1>Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map(item => (
          <div key={item.product_id} className="cart-item">
            {item.image_url && item.image_url.length > 0 && (
              <img 
                src={`http://localhost:3000${item.image_url}`} 
                alt={item.product_name} 
                className="cart-item-image" 
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            )}
            <div className="cart-item-details">
              <h2>{item.product_name}</h2>
              <p>Quantity: 
                <input 
                  type="number" 
                  value={item.quantity} 
                  min="1"
                  onChange={(e) => handleUpdateQuantity(item.product_id, e.target.value)} 
                />
              </p>
              <p>Price: ${item.price}</p>
              <p>Total: ${formatPrice(item.price * item.quantity)}</p>
              <button onClick={() => handleRemoveItem(item.product_id)}>Remove</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CartPage;
