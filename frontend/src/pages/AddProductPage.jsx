import React, { useState } from 'react';
import axios from 'axios';

const AddProductPage = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState([]);
  const token = localStorage.getItem('token');

  const handleAddProduct = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category_id', categoryId);
    images.forEach(image => formData.append('images', image));

    axios.post('http://localhost:3000/products', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        alert('Product added successfully');
      })
      .catch(error => {
        console.error('Error adding product:', error);
      });
  };

  return (
    <form onSubmit={handleAddProduct}>
      <h1>Add Product</h1>
      <div>
        <label>Product Name</label>
        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} />
      </div>
      <div>
        <label>Description</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label>Price</label>
        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div>
        <label>Stock</label>
        <input type="text" value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>
      <div>
        <label>Category ID</label>
        <input type="text" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
      </div>
      <div>
        <label>Images</label>
        <input type="file" multiple onChange={(e) => setImages([...e.target.files])} />
      </div>
      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProductPage;
