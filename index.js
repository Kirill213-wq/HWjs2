const express = require('express');
const app = express();

// 1.  додаємо це, щоб сервер розумів json з баді
app.use(express.json());

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

// 2. Функція додавання продукту через проміз
function addProduct(newProduct, isFail) {
  return new Promise((resolve, reject) => {
    
    if (isFail) {
      reject('Помилка збереження');
    } else {
      
      const createdProduct = {
        id: products.length + 1, 
        name: newProduct.name,
        price: newProduct.price,
        category: newProduct.category,
        image: newProduct.image || '' 
      };

      // Додаємо в масив
      products.push(createdProduct);

      
      resolve(createdProduct);
    }
  });
}

// GET /products
app.get('/products', (req, res) => {
  const { category, take } = req.query;
  let result = products;

  if (category) {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (take !== undefined) {
    const limit = parseInt(take, 10);
    if (!isNaN(limit) && limit >= 0) {
      result = result.slice(0, limit);
    }
  }

  res.status(200).json(result);
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(200).json(product);
});


app.post('/products', async (req, res) => {
  const { name, price, category, image } = req.body;
  
 
  const isFail = req.query.fail === 'true';

  // 1ша валідація перевірки 
  if (!name || typeof price !== 'number' || price <= 0 || !category) {
    return res.status(422).json({ error: 'Invalid product data' });
  }

  // 2га валідація перевірки на дублікат назви
  const duplicate = products.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    return res.status(409).json({ error: 'Conflict' });
  }

  // наш проміз
  try {
    const newProduct = await addProduct({ name, price, category, image }, isFail);
    return res.status(201).json(newProduct); 
  } catch (error) {
    return res.status(500).json({ error: 'Server Error' }); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

