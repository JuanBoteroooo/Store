import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get('http://localhost:3000/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setCartItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching cart items:', error);
      });
  }, [navigate]);

  const handlePayment = () => {
    const token = localStorage.getItem('token');
    const paymentDetails = { cardNumber, nameOnCard, expirationDate, cvv };

    axios.post('http://localhost:3000/purchase', { cartItems, total: calculateTotal(), paymentDetails }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        navigate('/thank-you', { state: { cartItems } });
      })
      .catch(error => {
        console.error('Error processing payment:', error);
      });
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  };

  const removeItem = (productId) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:3000/cart/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setCartItems(cartItems.filter(item => item.product_id !== productId));
      })
      .catch(error => {
        console.error('Error removing item:', error);
      });
  };

  const updateQuantity = (productId, quantity) => {
    const token = localStorage.getItem('token');
    axios.put(`http://localhost:3000/cart/${productId}`, { quantity }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setCartItems(cartItems.map(item => item.product_id === productId ? { ...item, quantity } : item));
      })
      .catch(error => {
        console.error('Error updating quantity:', error);
      });
  };

  return (
    <div className="cart-container">
      <h1>Cart</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p>No items found.</p>
          ) : (
            cartItems.map(item => (
              <div key={item.product_id} className="cart-item">
                <img src={`http://localhost:3000${item.image_url}`} alt={item.product_name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h2>{item.product_name}</h2>
                  <div className="quantity-container">
                    <label htmlFor={`quantity-${item.product_id}`}>Quantity:</label>
                    <input
                      id={`quantity-${item.product_id}`}
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                    />
                  </div>
                  <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
                  <p>Total: ${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                  <button className="remove-button" onClick={() => removeItem(item.product_id)}>
                    Remove  
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M14.348 14.849c-.781.781-2.047.781-2.828 0L10 12.828l-1.52 1.52c-.781.781-2.047.781-2.828 0s-.781-2.047 0-2.828L7.172 10l-1.52-1.52c-.781-.781-.781-2.047 0-2.828s2.047-.781 2.828 0L10 7.172l1.52-1.52c.781-.781 2.047-.781 2.828 0s.781 2.047 0 2.828L12.828 10l1.52 1.52c.781.781.781 2.047 0 2.828z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="payment-details">
          <h2>Payment Details</h2>
          <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="payment-form">
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Name on Card"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Expiration Date (MM/YY)"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
            <button type="submit" className="pay-button">
              Pay Now   
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zM9 15l-4-4h3V8h2v3h3L9 15z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
