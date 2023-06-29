const jwt = require("jsonwebtoken");
const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
    // Adicione as seguintes configurações para reconexão automática
    reconnect: true,
    reconnectInterval: 2000, // Intervalo de tempo para tentar reconectar (em milissegundos)
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados no middleware que gera o JWT: " + err.stack);
    return;
  }
  console.log("Conexão bem-sucedida ao banco de dados no arquivo do middleware que gera o JWT");
});

// Função para gerar o token JWT
const generateToken = (user) => {
  const token = jwt.sign(user, process.env.SECRET_KEY || 'sua-chave-secreta');
  return token;
};

// Função de autenticação com atualização da tabela de usuários
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json("Token não fornecido");
  }

  jwt.verify(token, process.env.SECRET_KEY || 'sua-chave-secreta', (err, user) => {
    if (err) {
      return res.status(403).json("Token inválido");
    }

    // Atualiza a coluna "token" na tabela "users" com o novo token
    const newToken = generateToken(user);
    const userId = user.id; // Supondo que o usuário tenha um campo "id"
    
    const sql = "UPDATE login SET token = ? WHERE id = ?";
    const values = [newToken, userId];
    
    db.query(sql, values, (err, result) => {
      if (err) {
        return res.status(500).json("Erro ao atualizar o token do usuário");
      }

      req.user = user;
      next();
    });
  });
};

module.exports = authenticateToken;