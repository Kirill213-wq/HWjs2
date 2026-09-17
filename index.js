const express = require('express');
const app = express();

//dfvdfvsfs
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.get('/stats', (req, res) => {
  res.json({
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

const products = [
  { id: 1, name: 'Laptop', price: 1200, category: 'electronics' },
  { id: 2, name: 'Smartphone', price: 800, category: 'electronics' },
  { id: 3, name: 'Headphones', price: 150, category: 'electronics' },
  { id: 4, name: 'Desk Chair', price: 200, category: 'furniture' },
  { id: 5, name: 'Dining Table', price: 450, category: 'furniture' },
];

// GET /products — з підтримкою query-параметрів category та take
app.get('/products', (req, res) => {
  const { category, take } = req.query;

  // Вихідний масив не змінюємо
  let result = products;

  // Фільтрація 
  if (category) {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Обмеження кількості через take 
  if (take !== undefined) {
    const limit = parseInt(take, 10);
    if (!isNaN(limit) && limit >= 0) {
      result = result.slice(0, limit);
    }
  }

  res.status(200).json(result);
});

// GET /products/:id  отримання одного продукту за id
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  // Валідація
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(200).json(product);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});