const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const app = express();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'store',
  password: '12bote34',
  port: 5432,
});

const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token verification failed', error: err.message });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header not provided' });
  }
};

// Middleware para verificar si el usuario es un vendedor
const checkSeller = async (req, res, next) => {
  const userId = req.user.userId;
  const userResult = await pool.query('SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = $1', [userId]);

  if (userResult.rows.length === 0 || userResult.rows[0].role_name !== 'seller') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

// Registro de usuarios
app.post('/register', async (req, res) => {
  const { username, password, email, role_id = 1 } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await pool.query(
      'INSERT INTO users (username, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, hashedPassword, email, role_id]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login de usuarios
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query('SELECT u.*, r.role_name AS profile FROM users u JOIN roles r ON u.role_id = r.role_id WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(403).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, profile: user.profile },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar el rol del usuario
app.put('/profile/role', authenticate, async (req, res) => {
  const { role_id } = req.body;

  if (!role_id) {
    return res.status(400).json({ error: 'Role ID is required' });
  }

  try {
    await pool.query('UPDATE users SET role_id = $1 WHERE user_id = $2', [role_id, req.user.userId]);
    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para actualizar la imagen de perfil del usuario
app.put('/profile/image', authenticate, upload.single('profileImage'), async (req, res) => {
  const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!profileImageUrl) {
    return res.status(400).json({ error: 'Profile image is required' });
  }

  try {
    await pool.query('UPDATE users SET profile_image_url = $1 WHERE user_id = $2', [profileImageUrl, req.user.userId]);
    res.status(200).json({ message: 'Profile image updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener perfil de usuario
app.get('/profile', authenticate, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT u.user_id, u.username, u.email, r.role_name, u.profile_image_url FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/checkout', authenticate, async (req, res) => {
  // Aquí se debería procesar el pago con un servicio real
  const { cardNumber, cardName, expirationDate, cvv } = req.body;

  // Simulación del procesamiento del pago
  if (!cardNumber || !cardName || !expirationDate || !cvv) {
    return res.status(400).json({ success: false, message: 'Payment details are incomplete' });
  }

  // Suponemos que el pago se procesó correctamente
  res.status(200).json({ success: true, message: 'Payment processed successfully' });
});

// Endpoint para procesar el pago y registrar la orden
app.post('/purchase', authenticate, async (req, res) => {
  const { cartItems, total, paymentDetails } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'No items in cart' });
  }

  try {
    // Crear una nueva orden
    const newOrder = await pool.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
      [req.user.userId, total]
    );

    const orderId = newOrder.rows[0].order_id;

    // Insertar items de la orden
    for (const item of cartItems) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Limpiar el carrito
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.userId]);

    res.status(200).json({ message: 'Purchase successful', orderId });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Endpoint para crear un producto
app.post('/products', authenticate, checkSeller, upload.array('images', 5), async (req, res) => {
  const { product_name, description, price, stock, category_id } = req.body;
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

  const numericPrice = parseFloat(price);

  if (isNaN(numericPrice)) {
    return res.status(400).json({ error: 'Invalid price format' });
  }

  try {
    const newProduct = await pool.query(
      'INSERT INTO products (product_name, description, price, stock, image_url, category_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [product_name, description, numericPrice, stock, JSON.stringify(imageUrls), category_id, req.user.userId]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (error) {
    console.error('Error adding product:', error); // Añadir un log para revisar el error
    res.status(400).json({ error: error.message });
  }
});

// Obtener productos
app.get('/products', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products');
    res.status(200).json(products.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para agregar productos al carrito
app.post('/cart', authenticate, async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    // Verificar si el producto ya está en el carrito
    const cartItemResult = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.userId, product_id]
    );

    if (cartItemResult.rows.length > 0) {
      // Si el producto ya está en el carrito, actualizar la cantidad
      const updatedCartItem = await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, req.user.userId, product_id]
      );
      res.status(200).json(updatedCartItem.rows[0]);
    } else {
      // Si el producto no está en el carrito, agregarlo
      const newCartItem = await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, added_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [req.user.userId, product_id, quantity]
      );
      res.status(201).json(newCartItem.rows[0]);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener items del carrito
app.get('/cart', authenticate, async (req, res) => {
  try {
    const cartItems = await pool.query(
      'SELECT ci.product_id, p.product_name, ci.quantity, p.price, p.image_url, (ci.quantity * p.price) AS total_price ' +
      'FROM cart_items ci JOIN products p ON ci.product_id = p.product_id WHERE ci.user_id = $1',
      [req.user.userId]
    );
    res.status(200).json(cartItems.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener categorías
app.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories');
    res.status(200).json(categories.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Endpoint para eliminar productos del carrito
app.delete('/cart/:product_id', authenticate, async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [req.user.userId, product_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener productos del vendedor
app.get('/seller/products', authenticate, checkSeller, async (req, res) => {
  try {
    const products = await pool.query(
      'SELECT * FROM products WHERE user_id = $1',
      [req.user.userId]
    );
    res.status(200).json(products.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para actualizar la cantidad de productos en el carrito
app.put('/cart/:product_id', authenticate, async (req, res) => {
  const { product_id } = req.params;
  const { quantity } = req.body;

  try {
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, req.user.userId, product_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para actualizar un producto
app.put('/products/:product_id', authenticate, checkSeller, upload.array('images', 5), async (req, res) => {
  const { product_id } = req.params;
  const { product_name, description, price, stock, category_id } = req.body;
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

  const numericPrice = parseFloat(price);

  if (isNaN(numericPrice)) {
    return res.status(400).json({ error: 'Invalid price format' });
  }

  try {
    const updatedProduct = await pool.query(
      'UPDATE products SET product_name = $1, description = $2, price = $3, stock = $4, image_url = $5, category_id = $6 WHERE product_id = $7 AND user_id = $8 RETURNING *',
      [product_name, description, numericPrice, stock, JSON.stringify(imageUrls), category_id, product_id, req.user.userId]
    );

    if (updatedProduct.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    res.status(200).json(updatedProduct.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error); // Añadir un log para revisar el error
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para eliminar un producto
app.delete('/products/:product_id', authenticate, checkSeller, async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE product_id = $1 AND user_id = $2 RETURNING *',
      [product_id, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting product:', error); // Añadir un log para revisar el error
    res.status(400).json({ error: error.message });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
