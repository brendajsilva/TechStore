const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produtos por categoria
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.findByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;