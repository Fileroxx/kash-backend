const authService = require("../services/authService");

const signup = (req, res) => {
  const { name, email, password } = req.body;
  authService.signup(name, email, password)
    .then(() => {
      res.json("Success");
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta de signup:", error);
      res.json("Error");
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  authService.login(email, password)
    .then(({ token, name, email }) => {
      res.json({ token, name, email });
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta de login:", error);
      if (error.name === "AuthenticationError") {
        console.error("Credenciais inválidas:", error);
        res.status(401).json("Credenciais inválidas");
      } else if (error.name === "DatabaseError") {
        console.error("Erro no banco de dados:", error);
        res.status(500).json("Erro no banco de dados");
      } else {
        console.error("Erro desconhecido:", error);
        res.status(500).json("Erro desconhecido");
      }
    });
};

module.exports = {
  signup,
  login,
}