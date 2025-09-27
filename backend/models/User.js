const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static create(userData, callback) {
    bcrypt.hash(userData.password, 10, (err, hash) => {
      if (err) return callback(err);
      
      db.query(
        'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
        [userData.name, userData.email, hash],
        callback
      );
    });
  }

  static findByEmail(email, callback) {
    db.query('SELECT * FROM users WHERE email = ?', [email], callback);
  }

  static findById(id, callback) {
    db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id], callback);
  }
}

module.exports = User;