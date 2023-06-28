const mysql = require("mysql");
require('dotenv').config();


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados: " + err.stack);
    return;
  }
  console.log("Conexão bem-sucedida ao banco de dados");
});


const createUser = (name, email, password) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
    const values = [name, email, password];

    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const findAll = () => {
  const sql = "SELECT * FROM login";
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const findById = (userId) => {
  const sql = "SELECT * FROM login WHERE id = ?";
  const values = [userId];
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};

const createAtivo = (userId, nomeAtivo, quantidadeAtivos, valorAtivo) => {
  const sql = "INSERT INTO ativos (nomeAtivo, quantidadeAtivos, valorAtivo, userId) VALUES (?, ?, ?, ?)";
  const values = [nomeAtivo, quantidadeAtivos, valorAtivo, userId];
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const findAtivosByUserId = (userId) => {
  const sql = "SELECT * FROM ativos WHERE userId = ?";
  const values = [userId];
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  createUser,
  findAll,
  findById,
  createAtivo,
  findAtivosByUserId,
};
