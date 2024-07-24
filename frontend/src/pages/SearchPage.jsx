import React from 'react';
import Product from '../components/Product';

const SearchPage = ({ products }) => {
  return (
    <div className="product-list">
      {products.map(product => (
        <Product key={product.product_id} product={product} />
      ))}
    </div>
  );
};

export default SearchPage;
