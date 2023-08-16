const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://127.0.0.1:5173',
  'https://smartfinsoluction-backend.vercel.app',
  'https://smartfin-soluction.vercel.app',
  'https://smartfin-soluction-git-feature-home-fileroxx.vercel.app/',
  'https://smartfin-soluction-git-feature-home-fileroxx.vercel.app/login'
];

// Aplicar as opções de configuração do CORS
app.use(cors({
  origin: allowedOrigins, // Permite todas as origens
  methods: "GET,PUT,POST,DELETE", // Permite os métodos HTTP necessários
  allowedHeaders: "Content-Type,Authorization", // Permite os cabeçalhos necessários
}));

app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  port: process.env.DB_PORT
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
    const token = jwt.sign(
      { name: user.name, userId: user.id, email: user.email },
      "chave-secreta",
      { expiresIn: "1h" }
    );

    return res.json({ token });
  });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json("Token não fornecido");
  }

  jwt.verify(token, "chave-secreta", (err, user) => {
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

app.get("/users/all", (req, res) => {
  const sql = "SELECT * FROM login";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.status(500).json("Error");
    }

    return res.json(result);
  });
});

app.get("/user/:token", (req, res) => {
  const token = req.params.token;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    // Verificar se o token é válido e não expirado, se necessário

    // Recuperar as informações do usuário do payload do token
    const userId = decodedToken.userId;
    const name = decodedToken.name;
    const email = decodedToken.email;

    // Use as informações do usuário para fazer a consulta no banco de dados ou realizar outras ações necessárias

    const user = {
      userId,
      name,
      email
    };

    return res.json(user);
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

app.post("/user/:token/ativo", (req, res) => {
  const token = req.params.token;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;
    const { nomeAtivo, quantidadeAtivos, valorAtivo } = req.body;

    const sql = "INSERT INTO ativos (nomeAtivo, quantidadeAtivos, valorAtivo, userId) VALUES (?, ?, ?, ?)";
    const values = [nomeAtivo, quantidadeAtivos, valorAtivo, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro");
      }

      if (result.affectedRows > 0) {
        return res.json("Sucesso");
      } else {
        return res.json("Falha");
      }
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

app.get("/user/:token/ativo", (req, res) => {
  const token = req.params.token;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;

    const sql = "SELECT * FROM ativos WHERE userId = ?";
    const values = [userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Error");
      }

      // Mapear os resultados do banco de dados para um formato desejado (opcional)
      const ativos = result.map((row) => ({
        id: row.id,
        nomeAtivo: row.nomeAtivo,
        quantidadeAtivos: row.quantidadeAtivos,
        valorAtivo: row.valorAtivo,
      }));

      return res.json(ativos);
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

app.delete("/user/:token/ativo/:id", (req, res) => {
  const token = req.params.token;
  const ativoId = req.params.id;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;

    const sql = "DELETE FROM ativos WHERE id = ? AND userId = ?";
    const values = [ativoId, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro");
      }

      if (result.affectedRows > 0) {
        return res.json("Sucesso");
      } else {
        return res.json("Falha");
      }
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});


app.put("/user/:token/ativo/:id", (req, res) => {
  const token = req.params.token;
  const ativoId = req.params.id;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;
    const { nomeAtivo, quantidadeAtivos, valorAtivo } = req.body;

    const sql = "UPDATE ativos SET nomeAtivo = ?, quantidadeAtivos = ?, valorAtivo = ? WHERE id = ? AND userId = ?";
    const values = [nomeAtivo, quantidadeAtivos, valorAtivo, ativoId, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro");
      }

      if (result.affectedRows > 0) {
        return res.json("Sucesso");
      } else {
        return res.json("Falha");
      }
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});



app.get("/alerta", (req, res) => {
  const userId = req.user.userId;

  const sql = "SELECT * FROM alertas WHERE userId = ?";
  const values = [userId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.status(500).json("Erro ao obter os alertas");
    }

    // Mapear os resultados do banco de dados para um formato desejado (opcional)
    const alertas = result.map((row) => ({
      id: row.id,
      ativo: row.ativo,
      gatilho: row.gatilho,
      precoAlvo: row.precoAlvo,
    }));

    return res.json(alertas);
  });
});

app.post("/alerta", (req, res) => {
  const { ativo, gatilho, precoAlvo } = req.body;
  const userId = req.user.userId;

  const sql = "INSERT INTO alertas (userId, ativo, gatilho, precoAlvo) VALUES (?, ?, ?, ?)";
  const values = [userId, ativo, gatilho, precoAlvo];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao executar a consulta: " + err.stack);
      return res.status(500).json("Erro ao criar o alerta");
    }

    if (result.affectedRows > 0) {
      return res.json("Alerta criado com sucesso");
    } else {
      return res.json("Falha ao criar o alerta");
    }
  });
});


// CREATE (Adicionar um novo gasto)
app.post("/user/:token/gastos", (req, res) => {
  const token = req.params.token;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;
    const { categoria, valor } = req.body;

    const sql = "INSERT INTO gastos (userId, categoria, valor) VALUES (?, ?, ?)";
    const values = [userId, categoria, valor];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao criar o gasto");
      }

      if (result.affectedRows > 0) {
        return res.json("Gasto criado com sucesso");
      } else {
        return res.json("Falha ao criar o gasto");
      }
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});


app.get("/user/:token/gastos", (req, res) => {
  const token = req.params.token;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;

    const sql = "SELECT * FROM gastos WHERE userId = ?";
    const values = [userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao obter os gastos");
      }

      // Mapear os resultados do banco de dados para um formato desejado (opcional)
      const gastos = result.map((row) => ({
        id: row.id,
        categoria: row.categoria,
        valor: row.valor,
        dataCriacao: row.dataCriacao,
        dataAtualizacao: row.dataAtualizacao,
      }));

      return res.json(gastos);
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

// UPDATE (Atualizar um gasto existente)
app.put("/user/:token/gastos/:id", (req, res) => {
  const token = req.params.token;
  const gastoId = req.params.id;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;
    const { categoria, valor } = req.body;

    const sql = "UPDATE gastos SET categoria = ?, valor = ? WHERE id = ? AND userId = ?";
    const values = [categoria, valor, gastoId, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao atualizar o gasto");
      }

      if (result.affectedRows > 0) {
        return res.json("Gasto atualizado com sucesso");
      } else {
        return res.json("Falha ao atualizar o gasto");
      }
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

// DELETE (Excluir um gasto existente)

app.delete("/user/:token/gastos/:id", (req, res) => {
  const token = req.params.token;
  const gastoId = req.params.id;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;

    const sql = "DELETE FROM gastos WHERE id = ? AND userId = ?";
    const values = [gastoId, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao excluir o gasto");
      }

      if (result.affectedRows > 0) {
        return res.json("Gasto excluído com sucesso");
      } else {
        return res.json("Falha ao excluir o gasto");
      }
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

app.post("/user/:token/renda", (req, res) => {
  const token = req.params.token;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");

    const userId = decodedToken.userId;
    const { valor } = req.body;

    const sql = "INSERT INTO renda (user_id, valor) VALUES (?, ?)";
    const values = [userId, valor];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao adicionar renda");
      }

      return res.json("Renda adicionada com sucesso");
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

app.get("/user/:token/renda", (req, res) => {
  const token = req.params.token;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");
    const userId = decodedToken.userId;

    const sql = "SELECT * FROM renda WHERE user_id = ?";
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao buscar renda");
      }

      const rendas = result;
      return res.json(rendas);
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});

app.put("/user/:token/renda/:rendaId", (req, res) => {
  const token = req.params.token;
  const rendaId = req.params.rendaId;
  const { valor, data } = req.body;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");
    const userId = decodedToken.userId;

    const sql = "UPDATE renda SET valor = ?, data = ? WHERE id = ? AND user_id = ?";
    const values = [valor, data, rendaId, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao atualizar renda");
      }

      return res.json("Renda atualizada com sucesso");
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});


app.delete("/user/:token/renda/:rendaId", (req, res) => {
  const token = req.params.token;
  const rendaId = req.params.rendaId;

  try {
    const decodedToken = jwt.verify(token, "chave-secreta");
    const userId = decodedToken.userId;

    const sql = "DELETE FROM renda WHERE id = ? AND user_id = ?";
    const values = [rendaId, userId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erro ao executar a consulta: " + err.stack);
        return res.status(500).json("Erro ao deletar renda");
      }

      return res.json("Renda deletada com sucesso");
    });
  } catch (error) {
    console.error("Erro ao verificar o token: " + error);
    return res.status(401).json("Token inválido");
  }
});



const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
