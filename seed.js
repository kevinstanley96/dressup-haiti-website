require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Define the same schema as in server.js
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  oldPrice: Number,
  img: String,
  tags: [String],
  category: String
});

const Product = mongoose.model('Product', productSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding.');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const jsonDirectory = path.join(__dirname, 'assets', 'json');
    const filenames = await fs.readdir(jsonDirectory);

    for (const filename of filenames) {
      if (path.extname(filename) === '.json' && filename !== 'all_products.json') {
        const filePath = path.join(jsonDirectory, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const products = JSON.parse(fileContent);
        const category = filename.replace('.json', '');

        const productsWithCategory = products.map(p => ({ ...p, category }));
        await Product.insertMany(productsWithCategory);
        console.log(`Seeded ${products.length} products from ${filename}`);
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();