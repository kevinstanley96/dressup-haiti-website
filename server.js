require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => console.error('Database connection error:', err));

// --- Mongoose Schema and Model ---
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  oldPrice: Number,
  img: String,
  tags: [String],
  category: String // We'll use this to find products
});

const Product = mongoose.model('Product', productSchema);


// Middleware
app.use(cors()); // Allows your frontend to talk to this server
app.use(express.json()); // Allows server to understand JSON

// Serve static files (HTML, CSS, JS) from the root directory
app.use(express.static(path.join(__dirname, '')));

// --- API Endpoints ---

// Endpoint to get products, optionally filtered by category
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch products.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});