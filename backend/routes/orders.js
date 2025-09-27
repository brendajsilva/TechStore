const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Criar pedido
router.post('/', verifyToken, (req, res) => {
    const { items, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Itens do pedido são obrigatórios' });
    }

    // Iniciar transação
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Erro ao iniciar transação' });
            }

            try {
                // Validar estoque primeiro
                for (const item of items) {
                    const [productResults] = await connection.promise().query(
                        'SELECT name, stock FROM products WHERE id = ?',
                        [item.productId]
                    );
                    
                    if (productResults.length === 0) {
                        await connection.rollback();
                        connection.release();
                        return res.status(400).json({ error: `Produto não encontrado` });
                    }
                    
                    if (productResults[0].stock < item.quantity) {
                        await connection.rollback();
                        connection.release();
                        return res.status(400).json({ 
                            error: `Estoque insuficiente para ${productResults[0].name}. Disponível: ${productResults[0].stock}` 
                        });
                    }
                }

                // Criar pedido
                const [orderResult] = await connection.promise().query(
                    'INSERT INTO orders (user_id, total, status, created_at) VALUES (?, ?, "pending", NOW())',
                    [req.userId, total]
                );
                
                const orderId = orderResult.insertId;

                // Adicionar itens ao pedido e atualizar estoque
                for (const item of items) {
                    await connection.promise().query(
                        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                        [orderId, item.productId, item.quantity, item.price]
                    );
                    
                    await connection.promise().query(
                        'UPDATE products SET stock = stock - ? WHERE id = ?',
                        [item.quantity, item.productId]
                    );
                }

                await connection.commit();
                connection.release();
                
                res.json({ 
                    message: 'Pedido criado com sucesso', 
                    orderId,
                    total 
                });
                
            } catch (error) {
                await connection.rollback();
                connection.release();
                console.error('Erro ao criar pedido:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    });
});

// Listar pedidos do usuário
router.get('/my-orders', verifyToken, (req, res) => {
    db.query(`
        SELECT o.id as order_id, o.total, o.status, o.created_at,
               oi.quantity, oi.price, p.name as product_name, p.image 
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id 
        JOIN products p ON oi.product_id = p.id 
        WHERE o.user_id = ? 
        ORDER BY o.created_at DESC
    `, [req.userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar pedidos:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

module.exports = router;