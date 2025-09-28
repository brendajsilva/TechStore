const pool = require('../config/database');

class Order {
  static async create(userId, items, totalAmount) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Criar pedido
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
        [userId, totalAmount]
      );
      const orderId = orderResult.insertId;

      // Adicionar itens do pedido
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Atualizar estoque
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      return orderId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT o.*, 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'product_name', p.name,
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async findById(orderId) {
    const [rows] = await pool.execute(
      `SELECT o.*, 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'product_name', p.name,
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = ?
       GROUP BY o.id`,
      [orderId]
    );
    return rows[0];
  }
}

module.exports = Order;