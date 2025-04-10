const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'product-db',
  database: 'products',
  password: 'password',
  port: 5432,
});

app.post('/products', async (req, res) => {
  const { name, price, description, stock } = req.body;
  const result = await pool.query(
    'INSERT INTO products(name, price, description, stock) VALUES($1, $2, $3, $4) RETURNING *',
    [name, price, description, stock]
  );
  res.status(201).json(result.rows[0]);
});

app.get('/products/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  res.json(result.rows[0] || {});
});

app.put('/products/:id', async (req, res) => {
  const { name, price, description, stock } = req.body;
  const result = await pool.query(
    'UPDATE products SET name = $1, price = $2, description = $3, stock = $4 WHERE id = $5 RETURNING *',
    [name, price, description, stock, req.params.id]
  );
  res.json(result.rows[0]);
});

app.listen(3001, () => console.log('Product Service running on port 3001'));