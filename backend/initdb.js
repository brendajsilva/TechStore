const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Conectar sem especificar o banco de dados
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      multipleStatements: true // Permitir múltiplos statements
    });

    console.log('📦 Conectado ao MySQL. Inicializando banco de dados...');

    // Caminho correto para o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'database', 'ecommerce.sql');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlFilePath}`);
    }

    // Ler o script SQL
    let sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Remover comentários e limpar o script
    sqlScript = sqlScript
      .replace(/--.*$/gm, '') // Remove comentários de linha
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários de bloco
      .trim();

    console.log('📄 Executando script SQL...');

    // Executar o script completo com multipleStatements habilitado
    await connection.query(sqlScript);

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('📊 Estrutura criada:');
    console.log('   👥 Tabela users');
    console.log('   🎮 Tabela products');
    console.log('   📦 Tabela orders');
    console.log('   🛒 Tabela order_items');
    console.log('   🔑 4 produtos de exemplo criados');
    console.log('   👤 Usuário admin criado (email: admin@techstore.com, senha: 123456)');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    if (error.code) {
      console.error('   Código do erro:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;