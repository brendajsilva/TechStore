const db = require('../config/database');

class Product {
  static getAll(callback) {
    db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock > 0
    `, callback);
  }

  static getById(id, callback) {
    db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [id], callback);
  }

  static getByCategory(categoryId, callback) {
    db.query('SELECT * FROM products WHERE category_id = ? AND stock > 0', [categoryId], callback);
  }

  static updateStock(productId, quantity, callback) {
    db.query('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', 
      [quantity, productId, quantity], callback);
  }
}

module.exports = Product;