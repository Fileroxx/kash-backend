const userService = require("../services/userService");
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
    console.error("Erro ao conectar ao banco de dados no userController " + err.stack);
    return;
  }
  console.log("Conexão bem-sucedida ao banco de dados no userController");
});


const getUsers = (req, res) => {
  userService.getUsers()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    });
};

const getUserByToken = (req, res) => {
  const token = req.headers.authorization;
  console.log('Token:', token);
  db.query('SELECT name, email, password FROM login WHERE token = ?', [token], (error, results) => {
    if (error) {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    } else {
      if (results.length > 0) {
        const userData = {
          name: results[0].name,
          email: results[0].email,
          password: results[0].password
        };
        res.json(userData);
      } else {
        res.json("User not found");
      }
    }
  });
};


const createAtivo = (req, res) => {
  const userId = req.params.id;
  const { nomeAtivo, quantidadeAtivos, valorAtivo } = req.body;
  userService.createAtivo(userId, nomeAtivo, quantidadeAtivos, valorAtivo)
    .then(() => {
      res.json("Success");
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    });
};

const getAtivos = (req, res) => {
  const userId = req.params.id;
  userService.getAtivos(userId)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    });
};

module.exports = {
  getUsers,
  getUserByToken,
  createAtivo,
  getAtivos,
};
