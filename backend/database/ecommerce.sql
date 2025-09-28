-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS techstore_db;
USE techstore_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(50),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
('Notebook Gamer', 'Potência máxima para jogos com RTX 4060, Intel i7 e 16GB RAM', 4299.00, 'Notebook Gamer Alto Desempenho.jpg', 'notebooks', 10),
('Mouse Gamer RGB', 'Alta precisão com estilo, 16000 DPI, 7 botões programáveis', 199.00, 'Mouse Gamer RGB 16000 DPI.jpg', 'perifericos', 25),
('Teclado Mecânico', 'Switches Blue, RGB personalizável, teclas anti-ghosting', 349.00, 'Teclado Mecânico Completo RGB.jpg', 'perifericos', 15),
('Headset Gamer 7.1', 'Som surround virtual, microfone retrátil, iluminação RGB', 279.00, 'Headset Gamer 7.1 Completo.jpg', 'audio', 20);