const db = require('../config/database');

class Order {
  static create(orderData, callback) {
    db.query(
      'INSERT INTO orders (user_id, total, status, created_at) VALUES (?, ?, "pending", NOW())',
      [orderData.user_id, orderData.total],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result.insertId);
      }
    );
  }

  static addOrderItem(orderId, productId, quantity, price, callback) {
    db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, quantity, price],
      callback
    );
  }

  static getByUserId(userId, callback) {
    db.query(`
      SELECT o.*, oi.quantity, oi.price, p.name as product_name, p.image 
      FROM orders o 
      JOIN order_items oi ON o.id = oi.order_id 
      JOIN products p ON oi.product_id = p.id 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `, [userId], callback);
  }
}

module.exports = Order;