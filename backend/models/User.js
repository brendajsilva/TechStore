const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    return result.insertId;
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, updateData) {
    const { email, password } = updateData;
    let query = 'UPDATE users SET ';
    let params = [];
    
    if (email) {
      query += 'email = ?';
      params.push(email);
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (params.length > 0) query += ', ';
      query += 'password = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;