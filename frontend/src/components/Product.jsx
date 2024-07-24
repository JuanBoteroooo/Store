import React, { useState } from 'react';
import axios from 'axios';

const Product = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const token = localStorage.getItem('token');

  const handleAddToCart = () => {
    axios.post('http://localhost:3000/cart', {
      product_id: product.product_id,
      quantity
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      alert('Product added to cart');
    })
    .catch(error => {
      console.error('Error adding product to cart:', error);
    });
  };

  return (
    <div className="product-item">
      <h2>{product.product_name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <div>
        {product.image_url && <img src={`http://localhost:3000${product.image_url[0]}`} alt={product.product_name} />}
      </div>
      <div className="quantity">
        <label htmlFor="quantity">Quantity:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
      </div>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default Product;
