const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');

const router = express.Router();

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.userId = user.userId;
    next();
  });
};

// Criar pedido
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Itens do pedido são obrigatórios' });
    }

    const orderId = await Order.create(req.userId, items, totalAmount);

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      orderId
    });

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar pedidos do usuário
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.userId);
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar pedido específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Verificar se o pedido pertence ao usuário
    if (order.user_id !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(order);

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;