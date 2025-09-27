const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

// Middleware para validar email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Middleware para validar senha
const validatePassword = (password) => {
    return password.length >= 6;
};

// Rota de verificação de token melhorada
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Token não fornecido' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar informações atualizadas do usuário
        db.query(
            'SELECT id, name, email, created_at FROM users WHERE id = ? AND active = 1',
            [decoded.id],
            (err, results) => {
                if (err || results.length === 0) {
                    return res.status(401).json({
                        success: false,
                        error: 'Usuário não encontrado ou inativo'
                    });
                }
                
                res.json({
                    success: true,
                    user: results[0],
                    message: 'Token válido'
                });
            }
        );
    } catch (err) {
        res.status(401).json({
            success: false,
            error: 'Token inválido ou expirado'
        });
    }
});

// Login melhorado
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validações
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de email inválido'
            });
        }

        // Buscar usuário no banco
        db.query(
            'SELECT * FROM users WHERE email = ? AND active = 1',
            [email],
            async (err, results) => {
                if (err) {
                    console.error('Erro no login:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno do servidor'
                    });
                }
                
                if (results.length === 0) {
                    return res.status(401).json({
                        success: false,
                        error: 'Email ou senha incorretos'
                    });
                }

                const user = results[0];
                
                // Verificar senha
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        error: 'Email ou senha incorretos'
                    });
                }

                // Gerar token
                const token = jwt.sign(
                    { 
                        id: user.id, 
                        email: user.email,
                        name: user.name
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' } // Token válido por 7 dias
                );

                res.json({
                    success: true,
                    message: 'Login realizado com sucesso!',
                    data: {
                        token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            created_at: user.created_at
                        }
                    }
                });
            }
        );
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Registro melhorado
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validações
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Todos os campos são obrigatórios'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'As senhas não coincidem'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de email inválido'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                error: 'A senha deve ter pelo menos 6 caracteres'
            });
        }

        if (name.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'O nome deve ter pelo menos 2 caracteres'
            });
        }

        // Verificar se usuário já existe
        db.query(
            'SELECT id FROM users WHERE email = ?',
            [email],
            async (err, results) => {
                if (err) {
                    console.error('Erro no registro:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno do servidor'
                    });
                }
                
                if (results.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Este email já está cadastrado'
                    });
                }

                // Hash da senha
                const hashedPassword = await bcrypt.hash(password, 12);

                // Inserir usuário
                db.query(
                    'INSERT INTO users (name, email, password, created_at, active) VALUES (?, ?, ?, NOW(), 1)',
                    [name.trim(), email.toLowerCase(), hashedPassword],
                    (err, results) => {
                        if (err) {
                            console.error('Erro ao criar usuário:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Erro ao criar conta'
                            });
                        }
                        
                        // Gerar token automaticamente após registro
                        const token = jwt.sign(
                            { 
                                id: results.insertId, 
                                email: email.toLowerCase(),
                                name: name.trim()
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: '7d' }
                        );

                        res.status(201).json({
                            success: true,
                            message: 'Conta criada com sucesso!',
                            data: {
                                token,
                                user: {
                                    id: results.insertId,
                                    name: name.trim(),
                                    email: email.toLowerCase(),
                                    created_at: new Date().toISOString()
                                }
                            }
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para recuperação de senha (simulada)
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    
    if (!email || !validateEmail(email)) {
        return res.status(400).json({
            success: false,
            error: 'Email inválido'
        });
    }

    // Simular envio de email
    res.json({
        success: true,
        message: 'Instruções para redefinição de senha enviadas para seu email'
    });
});

// Rota para logout (client-side)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout realizado com sucesso'
    });
});

module.exports = router;