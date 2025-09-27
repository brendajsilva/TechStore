CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Tabela de produtos
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    stock INT DEFAULT 0,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ALTER TABLE users 
    ADD COLUMN active TINYINT(1) DEFAULT 1 AFTER password;

);

-- Tabela de pedidos
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de itens do pedido
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Inserir categorias
INSERT INTO categories (name, description) VALUES 
('Eletrônicos', 'Dispositivos eletrônicos em geral'),
('Informática', 'Computadores, notebooks e acessórios'),
('Smartphones', 'Telefones celulares e acessórios'),
('Games', 'Consoles e jogos');

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image, stock, category_id) VALUES 
('iPhone 14 Pro', 'Smartphone Apple com câmera avançada', 8999.99, 'iphone14.jpg', 50, 3),
('MacBook Pro 14"', 'Notebook Apple com chip M2', 12999.99, 'macbookpro.jpg', 30, 2),
('PlayStation 5', 'Console de última geração', 4499.99, 'ps5.jpg', 20, 4),
('Samsung Galaxy S23', 'Smartphone Android topo de linha', 3999.99, 'galaxys23.jpg', 40, 3),
('Dell XPS 13', 'Ultrabook premium', 6999.99, 'xps13.jpg', 25, 2),
('Nintendo Switch', Console híbrido portátil', 2499.99, 'switch.jpg', 35, 4);