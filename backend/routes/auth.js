const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registro
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Usuário deve ter pelo menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], validate, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Verificar se email já existe
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criar usuário
    const userId = await User.create({ username, email, password });
    const token = generateToken(userId);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: userId, username, email }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Usuário é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], validate, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuário
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;