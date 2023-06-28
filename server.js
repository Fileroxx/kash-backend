const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

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

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
  const values = [name, email, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.json("Error");
    }

    if (result.affectedRows > 0) {
      return res.json("Success");
    } else {
      return res.json("Failed");
    }
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM login WHERE email = ? AND password = ?";
  const values = [email, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.status(500).json("Error");
    }

    if (result.length === 0) {
      return res.status(401).json("Credenciais inválidas");
    }

    const user = result[0];
    const token = jwt.sign({ name: user.name, userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    return res.json({ token });
  });
});

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json("Token não fornecido");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json("Token inválido");
    }

    req.user = user;
    next();
  });
};

app.get("/users", authenticateToken, (req, res) => {
  const sql = "SELECT * FROM login";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.status(500).json("Error");
    }

    return res.json(result);
  });
});

app.get("/user/:id", authenticateToken, (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT * FROM login WHERE id = ?";
  const values = [userId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.status(500).json("Error");
    }

    if (result.length === 0) {
      return res.status(404).json("Usuário não encontrado");
    }

    const user = result[0];
    return res.json(user);
  });
});

app.get("/ativos/:userId", authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM ativos WHERE userId = ?";
  const values = [userId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.status(500).json("Error");
    }

    return res.json(result);
  });
});

app.post("/ativos", authenticateToken, (req, res) => {
  const { userId, nomeAtivo, quantidadeAtivos, valorAtivo } = req.body;
  const sql = "INSERT INTO ativos (userId, nomeAtivo, quantidadeAtivos, valorAtivo) VALUES (?, ?, ?, ?)";
  const values = [userId, nomeAtivo, quantidadeAtivos, valorAtivo];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.json("Error");
    }

    if (result.affectedRows > 0) {
      return res.json("Success");
    } else {
      return res.json("Failed");
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
