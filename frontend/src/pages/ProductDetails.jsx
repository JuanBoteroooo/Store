import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/products/${id}`)
      .then(response => setProduct(response.data))
      .catch(error => console.error('Error fetching product details:', error));
  }, [id]);

  const handleAddToCart = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    axios.post('http://localhost:3000/cart', { product_id: id, quantity: 1 }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => alert('Product added to cart'))
      .catch(error => console.error('Error adding product to cart:', error));
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{product.product_name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductDetails;
