const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Listar todos os produtos
router.get('/', (req, res) => {
    db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock > 0
        ORDER BY p.created_at DESC
    `, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Buscar produto por ID
router.get('/:id', (req, res) => {
    db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
    `, [req.params.id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(results[0]);
    });
});

// Buscar produtos por categoria
router.get('/category/:categoryId', (req, res) => {
    db.query(
        'SELECT * FROM products WHERE category_id = ? AND stock > 0 ORDER BY created_at DESC',
        [req.params.categoryId],
        (err, results) => {
            if (err) {
                console.error('Erro ao buscar produtos por categoria:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.json(results);
        }
    );
});

module.exports = router;