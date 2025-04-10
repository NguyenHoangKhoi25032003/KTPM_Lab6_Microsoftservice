const express = require('express');
const { Pool } = require('pg');
const amqp = require('amqplib');
const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'order-db',
  database: 'orders',
  password: 'password',
  port: 5432,
});

async function notifyInventory(order) {
  const conn = await amqp.connect('amqp://rabbitmq');
  const channel = await conn.createChannel();
  await channel.assertQueue('inventory_updates');
  channel.sendToQueue('inventory_updates', Buffer.from(JSON.stringify(order)));
  setTimeout(() => conn.close(), 500);
}

app.post('/orders', async (req, res) => {
  const { customer_id, product_id, quantity } = req.body;
  const result = await pool.query(
    'INSERT INTO orders(customer_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *',
    [customer_id, product_id, quantity]
  );
  await notifyInventory(result.rows[0]);
  res.status(201).json(result.rows[0]);
});

app.get('/orders/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  res.json(result.rows[0] || {});
});

app.listen(3002, () => console.log('Order Service running on port 3002'));