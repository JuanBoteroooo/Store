import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    images: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/seller/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/categories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Verificar que el precio, stock y categoryId no sean negativos
    if ((name === 'price' || name === 'stock' || name === 'categoryId') && value < 0) {
      return;
    }

    // Limitar la longitud del texto a 40 caracteres
    if ((name === 'productName' || name === 'description') && value.length > 40) {
      return;
    }

    setProductData({
      ...productData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setProductData({
      ...productData,
      images: e.target.files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('product_name', productData.productName);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('category_id', productData.categoryId);
    for (let i = 0; i < productData.images.length; i++) {
      formData.append('images', productData.images[i]);
    }

    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/products/${editingProductId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setIsEditing(false);
        setEditingProductId(null);
      } else {
        await axios.post('http://localhost:3000/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      fetchProducts();
      setProductData({
        productName: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        images: []
      });
    } catch (error) {
      console.error('Error adding/updating product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setEditingProductId(product.product_id);
    setProductData({
      productName: product.product_name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id,
      images: []
    });
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="seller-dashboard">
      <h2>Seller Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <h3>{isEditing ? 'Edit Product' : 'Add Product'}</h3>
        <input
          type="text"
          name="productName"
          value={productData.productName}
          onChange={handleInputChange}
          placeholder="Product Name"
          required
          maxLength="40"
        />
        <input
          name="description"
          value={productData.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
          maxLength="40"
        />
        <input
          type="number"
          name="price"
          value={productData.price}
          onChange={handleInputChange}
          placeholder="Price"
          required
          min="0"
        />
        <input
          type="number"
          name="stock"
          value={productData.stock}
          onChange={handleInputChange}
          placeholder="Stock"
          required
          min="0"
        />
        <select
          name="categoryId"
          value={productData.categoryId}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
        <input
          type="file"
          name="images"
          multiple
          onChange={handleFileChange}
          required={!isEditing}
        />
        <button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
      </form>
      <h3>Your Products</h3>
      <div className="product-list">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => (
            <div key={product.product_id} className="product-item">
              <h4>{product.product_name}</h4>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock}</p>
              {product.image_url && product.image_url.length > 0 && (
                <img src={`http://localhost:3000${product.image_url[0]}`} alt={product.product_name} />
              )}
              <button onClick={() => handleEditProduct(product)}>Edit</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
