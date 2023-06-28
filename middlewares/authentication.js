const jwt = require("jsonwebtoken");

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

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
