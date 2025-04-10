const express = require('express');
const httpProxy = require('http-proxy');
const app = express();
const proxy = httpProxy.createProxyServer();

app.use('/products', (req, res) => proxy.web(req, res, { target: 'http://product-service:3001' }));
app.use('/orders', (req, res) => proxy.web(req, res, { target: 'http://order-service:3002' }));
app.use('/customers', (req, res) => proxy.web(req, res, { target: 'http://customer-service:3003' }));

app.listen(3000, () => console.log('API Gateway running on port 3000'));