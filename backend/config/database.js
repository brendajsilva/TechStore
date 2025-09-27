const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senai',
    database: process.env.DB_NAME || 'db_ecommerce',
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Erro conectando ao MySQL:', err.message);
        return;
    }
    console.log('✅ Conectado ao MySQL!');
    console.log('📊 Banco de dados:', process.env.DB_NAME);
});

module.exports = connection;