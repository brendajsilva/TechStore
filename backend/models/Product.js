const pool = require('../config/database');

class Product {
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE stock_quantity > 0 ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByCategory(category) {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE category = ? AND stock_quantity > 0 ORDER BY created_at DESC',
      [category]
    );
    return rows;
  }

  static async updateStock(id, quantity) {
    const [result] = await pool.execute(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
      [quantity, id, quantity]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Product;