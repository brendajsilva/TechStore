const mysql = require('mysql2');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senai',
    port: process.env.DB_PORT || 3306
};

console.log('🔄 Inicializando banco de dados...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        process.exit(1);
    }

    console.log('✅ Conectado ao MySQL!');
    initializeDatabase();
});

function query(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

async function initializeDatabase() {
    try {
        // Criar banco de dados
        await query('CREATE DATABASE IF NOT EXISTS db_ecommerce');
        console.log('✅ Banco de dados criado');
        
        // Usar o banco
        await query('USE db_ecommerce');
        console.log('✅ Usando banco db_ecommerce');
        
        // Criar tabelas
        await createTables();
        
        // Inserir dados
        await insertData();
        
        console.log('🎉 Banco inicializado com sucesso!');
        console.log('👤 Usuário teste: teste@email.com');
        console.log('🔑 Senha: password');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        connection.end();
        process.exit(0);
    }
}

async function createTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
        
        `CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description TEXT
        )`,
        
        `CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image VARCHAR(255),
            stock INT DEFAULT 0,
            category_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            total DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT,
            product_id INT,
            quantity INT NOT NULL,
            price DECIMAL(10,2) NOT NULL
        )`
    ];

    for (let i = 0; i < tables.length; i++) {
        await query(tables[i]);
        console.log(`✅ Tabela ${i + 1} criada`);
    }
}

async function insertData() {
    const inserts = [
        `INSERT IGNORE INTO categories (id, name, description) VALUES 
        (1, 'Eletrônicos', 'Dispositivos eletrônicos em geral'),
        (2, 'Informática', 'Computadores, notebooks e acessórios'),
        (3, 'Smartphones', 'Telefones celulares e acessórios'),
        (4, 'Games', 'Consoles e jogos')`,
        
        `INSERT IGNORE INTO products (id, name, description, price, image, stock, category_id) VALUES 
        (1, 'iPhone 14 Pro', 'Smartphone Apple com chip A16 Bionic, 128GB, 5G', 8999.99, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 50, 3),
        (2, 'MacBook Pro 14"', 'Notebook Apple com chip M2 Pro, 16GB RAM, 512GB SSD', 12999.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 30, 2),
        (3, 'PlayStation 5', 'Console Sony PS5 com controle DualSense, 825GB', 4499.99, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400', 20, 4),
        (4, 'Samsung Galaxy S23', 'Smartphone Android, 256GB, Câmera 50MP', 3999.99, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', 40, 3),
        (5, 'Dell XPS 13', 'Ultrabook Intel Core i7, 16GB RAM, 512GB SSD', 6999.99, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400', 25, 2),
        (6, 'Nintendo Switch', 'Console híbrido portátil, 32GB, Joy-Cons', 2499.99, 'https://images.unsplash.com/photo-1556009114-ecf40a416c70?w=400', 35, 4),
        (7, 'iPad Air', 'Tablet Apple 10.9", Chip M1, 64GB, 5G', 5299.99, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 15, 1),
        (8, 'Samsung Odyssey G7', 'Monitor Gamer 32" Curvo, 240Hz, QHD', 3299.99, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', 10, 1)`,

        `INSERT IGNORE INTO users (id, name, email, password) VALUES 
        (1, 'Usuário Teste', 'teste@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')`
    ];

    for (let i = 0; i < inserts.length; i++) {
        await query(inserts[i]);
        console.log(`✅ Dados ${i + 1} inseridos`);
    }
}